import type { User } from "../generated/prisma/client";

export function sortUsers(users:User[]){
   return users.sort((a, b) => {
      if(a.organizationName && b.organizationName){
         if(a.organizationName > b.organizationName){
            return -1;
         } else if(a.organizationName < b.organizationName){
            return 1;
         } else{
            return 0;
         }
      }else if(a.organizationName && b.familyName){
         if(a.organizationName > b.familyName){
            return -1;
         }else if(a.organizationName < b.familyName){
            return 1;
         }else{
            return 0;
         }
      }else if(a.familyName && b.organizationName){
         if(a.familyName > b.organizationName){
            return -1;
         }else if(a.familyName < b.organizationName){
            return 1;
         }else{
            return 0;
         }
      }else if(a.familyName && b.familyName){
         if(a.familyName > b.familyName){
            return -1;
         }else if(a.familyName < b.familyName){
            return 1;
         }else {
            return 0;
         }
      }else {
         return 0;
      }
   });
}