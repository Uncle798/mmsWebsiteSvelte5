import { EventSchemas } from "inngest";
import * as v from 'valibot';

const UnitUnavailableWhileRenting = {
   "leaseCreated": v.object({
      leaseId: v.pipe(v.string(), v.cuid2())
   }),
   "depositPaid": v.object({
      leaseId: v.pipe(v.string(), v.cuid2()),
   })
}

export const schemas = new EventSchemas().fromSchema(UnitUnavailableWhileRenting);