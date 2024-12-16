import { prisma } from '$lib/server/prisma';
import { dropbox } from '$lib/server/dropbox';
import type { Error, files } from 'dropbox';
import { decryptRSA } from '@anvilco/encryption';
import { ANVIL_RSA_PRIVATE_KEY_BASE64, ANVIL_WEBHOOK_TOKEN } from '$env/static/private';
import type { RequestHandler } from './$types';
import { stripe } from '$lib/server/stripe';

const key = Buffer.from(ANVIL_RSA_PRIVATE_KEY_BASE64, 'base64').toString('ascii');

export const POST: RequestHandler = async (event) => {
   const data = await event.request.json();
   if(data.token === ANVIL_WEBHOOK_TOKEN){
      const decrypted:string = decryptRSA(key, data.data);
      const object = JSON.parse(decrypted);
      const { etchPacket, signers } = object;
      if(signers[0].completedAt && object.status === 'completed' && object.routingOrder === 1){
         prisma.lease.update({
            where: {
               anvilEID: etchPacket.eid
            },
            data: {
               leaseReturnedAt: signers[0].completedAt
            }
         })
         console.log('lease')
      }
      if(object.downloadZipURL){
         const url:string = object.downloadZipURL;
         const name:string = object.name;
         dropbox.filesSaveUrl({ url, path: `/${name.replace(/ /gm, '_').trim()}.pdf` })
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
