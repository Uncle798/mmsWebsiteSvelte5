import { prisma } from '$lib/server/prisma';
import { dropbox } from '$lib/server/dropbox';
import type { Error, files } from 'dropbox';
import { decryptRSA } from '@anvilco/encryption';
import { ANVIL_RSA_PRIVATE_KEY_BASE64, ANVIL_WEBHOOK_TOKEN } from '$env/static/private';
import type { RequestHandler } from './$types';

const key = Buffer.from(ANVIL_RSA_PRIVATE_KEY_BASE64, 'base64').toString('ascii');

export const POST: RequestHandler = async (event) => {
   const data = await event.request.json();
   console.log(data);
   if(data.token === ANVIL_WEBHOOK_TOKEN){
      const decrypted = decryptRSA(key, data.data);
      console.log(decrypted);
      if(decrypted.etchPacket.completedAt){
         const lease = await prisma.lease.update({
            where: {
               anvilEID:String(decrypted.etchPacket.eid),
            },
            data: {
               leaseReturnedAt: decrypted.etchPacket.completedAt,
            }
         })
         console.log(lease);
         const downloadUrl = decrypted['downloadZipURL'];
         await dropbox.filesSaveUrl(downloadUrl)
         .then((response) => {
            console.log(response);
          })
          .catch((uploadErr: Error<files.UploadError>) => {
            console.error(uploadErr);
          });
      }
   }
   return new Response(JSON.stringify('ok'), {status: 200});
}