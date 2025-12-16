import * as v from 'valibot';

export const newVendorFormSchema = v.object({
    organizationName: v.string(),
});
export type NewVendorFormSchema = typeof newVendorFormSchema;