import { EventSchemas } from "inngest";
import * as v from 'valibot';

const UnitUnavailableWhileRenting = {
   "leaseProcessStarted": v.object({
      unitNum: v.string()
   }),
   "leaseFinalized": v.object({
      leaseId: v.pipe(v.string(), v.cuid2())
   })
}

export const schemas = new EventSchemas().fromSchema(UnitUnavailableWhileRenting);