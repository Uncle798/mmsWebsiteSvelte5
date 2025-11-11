<script lang='ts'>
	import Combobox from "$lib/formComponents/Combobox.svelte";
	import DateInput from "$lib/formComponents/DateInput.svelte";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import NumberInput from "$lib/formComponents/NumberInput.svelte";
	import Switch from "$lib/formComponents/Switch.svelte";
	import type { OnboardingExistingLeaseSchema } from "$lib/formSchemas/onboardingExistingLeaseSchema";
	import type { Unit, User, Address } from "@prisma/client";
	import dayjs from "dayjs";
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";

   interface Props {
      data: SuperValidated<Infer<OnboardingExistingLeaseSchema>>;
      units: Unit[];
      customer: User;
      address: Address;
      classes?: string;
   }
   let { data, units, customer, address, classes}:Props = $props();
   let { form, message, errors, constraints, enhance, delayed, timeout } = superForm(data,{
      onSubmit(input) {
         input.formData.set('unitNum', $form.unitNum)
         console.log(input.formData)
      },
   });
   const comboboxData:{label:string, value:string}[] = [];
   for(const unit of units){
      comboboxData.push({label: unit.num.replace(/^0+/gm, ''), value: unit.num})
   }
</script>

<div class={classes}>
   <FormMessage message={$message} />
   <form action="/forms/onboardingExistingLease" method="POST" use:enhance >
      <div class="flex flex-col gap-2">
         <DateInput
            value={$form.createdDate}
            errors={$errors.createdDate}
            constraints={$constraints.createdDate}
            label='Lease created date'
            name='createdDate'
            min={dayjs('jan 1 1970').toDate()}
            max={new Date()}
         />
         <Combobox
            label='Select Unit'
            data={comboboxData}
            onValueChange={(e) => {
               $form.unitNum = e.value[0];
            }}
         />
         <DateInput
            value={$form.leaseEffectiveDate}
            errors={$errors.leaseEffectiveDate}
            constraints={$constraints.leaseEffectiveDate}
            label='Lease effective date'
            name='leaseEffectiveDate'
            min={dayjs('jan 1 1970').toDate()}
            max={new Date()}
         />
         <NumberInput
            value={$form.price}
            errors={$errors.price}
            constraints={$constraints.price}
            label='Price'
            name='price'
         />
         <NumberInput
            value={$form.numKeys}
            errors={$errors.numKeys}
            constraints={$constraints.numKeys}
            name='numKeys'
            label='Number of keys'
         />
         <Switch
            label='Rented by an organization'
            onCheckedChange={(e) => {
               $form.organization = e.checked
            }}
            name='organization'
            checked={$form.organization}
         />
         <Switch
            label='Property subject to lien'
            onCheckedChange={(e) => {
               $form.propertySubjectToLien = e.checked;
            }}
            name='propertySubjectToLien'
            checked={$form.propertySubjectToLien}
         />
         <input type="hidden" name='customerId' value={customer.id} />
         <input type="hidden" name='addressId' value={address.addressId} />
         <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} />
      </div>
   </form>
</div>