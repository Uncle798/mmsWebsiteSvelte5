import Stripe from "stripe";
import dotenv from 'dotenv'
import pricingData from '../prisma/pricingData';
import unitData from "../prisma/unitData";




async function main() {
   dotenv.config()
   const stripe = new Stripe(process.env.STRIPE_SECRET_TEST,{
      typescript:true,
   });
   const prices = await stripe.prices.list();
   if(prices.data.length === 0){
      pricingData.forEach(async (price) => {
         if(price.size !== 'ours') {
            const stripPrice = await stripe.prices.create({
               currency: 'usd',
               unit_amount: price.price * 100,
               product_data:{
                  name: `Monthly rent ${price.size.replace(/^0+/gm, '').replace(/x0/gm, 'x')}`,
                  metadata: {
                     size: price.size
                  }
               },
               recurring: {
                  interval: 'month'
               }
            })
            console.log('stripe price: ', stripPrice)
         }
      })
   }

}

main().catch((err) =>{
   console.error(err);
   process.exit(1);
})