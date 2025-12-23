import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { newExpenseFormSchema } from '$lib/formSchemas/newExpenseFormSchema';
import { ratelimit } from '$lib/server/rateLimit';
import { box } from '$lib/server/box';
import { prisma } from '$lib/server/prisma';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import type { SearchResultItem } from 'box-node-sdk/lib/schemas/searchResultItem';
import { generateByteStreamFromBuffer } from 'box-node-sdk/lib/internal/utils';
dayjs.extend(utc)
export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=employee');
      }
      const formData = await event.request.formData();
      const newExpenseForm = await superValidate(formData, valibot(newExpenseFormSchema));
      if(!newExpenseForm.valid){
         console.log(newExpenseForm);
         return message(newExpenseForm, 'Form invalid');
      }
      const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id);
      if(!success) {
			const timeRemaining = Math.floor((reset - Date.now()) /1000);
			return message(newExpenseForm, `Please wait ${timeRemaining}s before trying again.`);
		}
      const { data } = newExpenseForm;
      const vendor = await prisma.user.findUnique({
         where: {
            id: data.vendorId
         }
      });
      if(!vendor){
         message(newExpenseForm, 'Vendor not found');
      }
      const { receipt } = data;
      if(receipt.size < 1024 * 1024 * 5 ){
         const folderExists = await box.search.searchForContent({
            ancestorFolderIds: ['356856801330'],
            query: dayjs(data.datePurchased).format('YYYY-MM-DD'),
            contentTypes: [ 'name' ],
            type: 'folder',
         });
         let folderId = '';
         if(folderExists && folderExists.totalCount === 0){
            const folder = await box.folders.createFolder({
               name: dayjs(data.datePurchased).format('YYYY-MM-DD'),
               parent: { id: '356856801330'}
            });
            folderId = folder.id
         } 
         if(folderExists.entries && folderExists.entries[0]){
            const entry = folderExists.entries[0] as SearchResultItem;
            folderId = entry.id
         }

         let fileName = `Receipt ${vendor?.organizationName} ${dayjs(data.datePurchased).format('MM-DD-YYYY')} ${data.amount}${receipt.name.substring(receipt.name.lastIndexOf('.'))}`;
         let fileNumber = 1;
         let err: string | undefined = undefined;
         async function fileNameOk(fileName:string){
            await box.uploads.preflightFileUploadCheck({
               name: fileName,
               size: receipt.size,
               parent: { id: folderId }
            }).catch(async (error) => {
               err = error.responseInfo.body.code;
            });
            if(err === 'item_name_in_use'){
               fileName = `Receipt ${vendor?.organizationName} ${dayjs(data.datePurchased).format('MM-DD-YYYY')}[${fileNumber}]${receipt.name.substring(receipt.name.lastIndexOf('.'))}`;
               fileNumber ++;
               err = undefined;
               console.log(fileName);
               return false;
            } else {
               return true;
            }
         }
         let ok = false;
         do {
            ok = await fileNameOk(fileName);
         } while(ok === false)
         const file = await box.uploads.uploadFile({
            attributes: {
               name: fileName,
               parent: {id: folderId}
            },
            file: generateByteStreamFromBuffer(await receipt.arrayBuffer())
         });
         let url:string | undefined  = undefined;
         console.log(data.datePurchased)
         if(file.entries){
            url = await box.downloads.getDownloadFileUrl(file.entries[0].id)
            if(url){
               await prisma.expense.create({
                  data: {
                     amount: parseFloat(data.amount),
                     datePurchased: data.datePurchased,
                     employeeId: data.employeeId,
                     vendorId: data.vendorId,
                     receiptLink: url,
                     explanation: data.explanation,
                     boxFileId: file.entries[0].id
                  }
               });
            }
         }
         return redirect(302, '/expenses/new?toast=expenseCreated')
      }
   }
};