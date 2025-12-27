import { prisma } from '$lib/server/prisma';
//@ts-ignore
import { decryptRSA } from '@anvilco/encryption';
import { ANVIL_RSA_PRIVATE_KEY_BASE64 } from '$env/static/private';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { invoiceRentNote } from '$lib/utils/invoiceNoteRent';

const key = Buffer.from(ANVIL_RSA_PRIVATE_KEY_BASE64, 'base64').toString('ascii');

export const POST: RequestHandler = async (event) => {
   const data = await event.request.json();
   if(data.action === 'signerComplete' || data.action === 'etchPacketComplete'){
      const decrypted:string = decryptRSA(key, data.data);
      const object = JSON.parse(decrypted);
      const { etchPacket, signers } = object;
      if(signers[0].completedAt && object.status === 'completed' && object.routingOrder === 1){
         await prisma.lease.update({
            where: {
               anvilEID: etchPacket.eid
            },
            data: {
               leaseReturnedAt: signers[0].completedAt
            }
         })
      }
      if(object.downloadZipURL){
         // const url:string = object.downloadZipURL;
         // const name:string = object.name;
         // dropbox.filesSaveUrl({ url, path: `/${name.replace(/ /gm, '_').trim()}.pdf` })
         //    .then((response) => {
         //       console.log(response);
         //    })
         //    .catch((uploadErr: Error<files.UploadError>) => {
         //       console.error(uploadErr);
         //    });
            const createInvoice = async () => {        
               const lease = await prisma.lease.findUnique({
                  where: {
                     anvilEID: object.eid
                  }
               })
               if(!lease){
                  error(404)
               }
               await prisma.invoice.create({
                  data: {
                     customerId: lease.customerId,
                     invoiceAmount: lease.price,
                     invoiceNotes: invoiceRentNote(lease.unitNum, lease.leaseEffectiveDate),
                     invoiceDue: lease.leaseEffectiveDate,
                     leaseId: lease.leaseId
                  }
               })
            }
            createInvoice();
         }
      }
   return new Response(JSON.stringify('ok'), {status: 200});
}
