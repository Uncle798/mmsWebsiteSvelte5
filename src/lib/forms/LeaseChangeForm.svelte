<script lang="ts">
	import TextInput from "$lib/formComponents/TextInput.svelte";
	import type { LeaseChangeFormSchema } from "$lib/formSchemas/leaseChangeFormSchema";
	import type { Infer, SuperValidated } from "sveltekit-superforms";
   import { superForm } from "sveltekit-superforms";
	import type { Lease } from "../../generated/prisma/browser";
	import DatePickerSingle from "$lib/formComponents/DatePickerSingle.svelte";
	import dayjs from "dayjs";
	import NumberInput from "$lib/formComponents/NumberInput.svelte";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";

   interface Props {
      data: SuperValidated<Infer<LeaseChangeFormSchema>>;
      lease: Lease;
      modalOpen?: boolean;
      classes?: string;
   }
   let { data, lease, modalOpen=$bindable(), classes }:Props =$props();
   // svelte-ignore state_referenced_locally
   let { form, message, errors, constraints, enhance, delayed, timeout } = superForm(data, {
      onUpdate() {
         modalOpen = false
      }
   });
</script>
<div class={classes}>
   <FormMessage message={$message} />
   <form action="/forms/leaseChangeForm" method="POST" use:enhance>
      <NumberInput
         value={$form.price}
         errors={$errors.price}
         constraints={$constraints.price}
         label='Change price of unit {lease.unitNum.replace(/^0+/gm, '')}'
         name='price'
         placeholder={lease.price.toString()}
      />
      <NumberInput
         value={$form.depositAmount}
         errors={$errors.depositAmount}
         constraints={$constraints.depositAmount}
         label='Change deposit amount'
         name='depositAmount'
      />
      <DatePickerSingle
         value={$form.leaseCreatedAt}
         name='leaseCreatedAt'
         errors={$errors.leaseCreatedAt}
         constraints={$constraints.leaseCreatedAt}
         label='Change lease created date'
         placeholder={dayjs(lease.leaseCreatedAt).format('MM/DD/YYYY')}
      />
      <DatePickerSingle
         value={$form.leaseEffectiveDate}
         name='leaseEffectiveDate'
         errors={$errors.leaseEffectiveDate}
         constraints={$constraints.leaseEffectiveDate}
         label='Change lease effective date'
         placeholder={dayjs(lease.leaseEffectiveDate).format('MM/DD/YYYY')}
      />
      <input type="hidden" value={lease.leaseId} name='leaseId'/>
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} classes='mt-2'/>  
   </form>
</div>