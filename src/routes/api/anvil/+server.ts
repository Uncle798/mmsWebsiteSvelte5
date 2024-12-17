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
   console.log('anvil Endpoint data:', data)
   if(data.action === 'signerComplete' || data.action === 'etchPacketComplete'){
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
      // if(object.downloadZipURL){
      //    const url:string = object.downloadZipURL;
      //    const name:string = object.name;
      //    dropbox.filesSaveUrl({ url, path: `/${name.replace(/ /gm, '_').trim()}.pdf` })
      //       .then((response) => {
      //          console.log(response);
      //       })
      //       .catch((uploadErr: Error<files.UploadError>) => {
      //          console.error(uploadErr);
      //       });
      //    }
      //    const lease = await prisma.lease.findUnique({
      //       where: {
      //          anvilEID: etchPacket.eid
      //       }
      //    })
      //    const customer = await prisma.user.findUnique({
      //       where: {
      //          id: lease?.customerId
      //       }
      //    })
      //    const unit = await prisma.unit.findUnique({
      //       where: {
      //          num: lease?.unitNum
      //       } 
      //    })
      //    const products = await stripe.products.list();
      //    const product = products.data.find((product) => product.metadata.size === unit?.size)
      //    console.log(product)
      //    if(customer){
      //       stripe.subscriptions.create({
      //          customer: customer!.id,
      //          items: [
      //             {
      //                price_data: {
      //                   currency: 'usd',
      //                   product: product!.id,
      //                   recurring: {
      //                      interval: 'month'
      //                   },
      //                   unit_amount: lease!.price * 100
      //                }
      //             }
      //          ]
      //       })
      //    }
      }
   return new Response(JSON.stringify('ok'), {status: 200});
}
