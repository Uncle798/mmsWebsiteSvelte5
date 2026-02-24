import { prisma } from '../src/lib/server/prisma'
import  unitData from './unitData'
import pricingData  from './pricingData'
import sizeDescription  from './sizeDescription'
import type { Unit } from '@prisma/client'

type PartialUnit = Pick<Unit, 'size' | 'num' | 'building'>

function makeUnit(unit:PartialUnit){
   const sD = sizeDescription.find((description) => description.size === unit.size);
   const price = pricingData.find((p) => p.size === unit.size);
   const newUnit:Unit= {} as Unit;
   if(unit.size === 'ours'){
      newUnit.building=unit.building;
      newUnit.num = unit.num;
      newUnit.size = unit.size;
      newUnit.leasedPrice =  0;
      newUnit.advertisedPrice = price?.price || 0;
      newUnit.deposit = price?.price || 5;
      newUnit.description = sD?.description ? sD.description : '';
      newUnit.unavailable = true;
   } else {
      newUnit.building=unit.building;
      newUnit.num = unit.num;
      newUnit.size = unit.size;
      newUnit.leasedPrice =  0;
      newUnit.advertisedPrice = price?.price || 0;
      newUnit.deposit = price?.price || 5;
      newUnit.description = sD?.description ? sD.description : '' 
      newUnit.unavailable = false;
   }
return newUnit
}

async function main() {
   const data:Unit[] = [];
   for(const unit of unitData){
      data.push(makeUnit(unit))
   }
   await prisma.unit.createMany({
      data,
   })
   await prisma.user.create({
      data: {
         givenName: 'Eric',
         familyName: 'Branson',
         email: 'eric.branson@gmail.com',
         emailVerified: true,
         employee: true,
         admin: true,
      }
   })
}

main().catch((error)=>{
   console.log(error);
   process.exit(1);
})
.finally(()=>{
   prisma.$disconnect();
});