import type { User } from "../../generated/prisma/client";

export function userName(user:User){
   return user.organizationName ? user.organizationName : `${user.givenName} ${user.familyName}`
} 