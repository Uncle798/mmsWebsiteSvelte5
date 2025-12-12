<script lang='ts'>
	import DatePickerSingle from "$lib/formComponents/DatePickerSingle.svelte";
	import type { OnboardingCreateManyInvoicesFormSchema } from "$lib/formSchemas/onboardingCreateManyInvoicesFormSchema";
	import type { Infer, SuperValidated } from "sveltekit-superforms";
   import { superForm } from "sveltekit-superforms";
	import type { Lease } from "../../generated/prisma/client";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";

   interface Props {
      data: SuperValidated<Infer<OnboardingCreateManyInvoicesFormSchema>>;
      lease: Lease;
      modalOpen?: boolean;
      classes?: string;
   }
   let { data, lease, modalOpen=$bindable(), classes, }:Props = $props();
   let { form, message, errors, constraints, enhance, delayed, timeout, capture, restore, } = superForm(data, {
      onUpdated() {
         if(!$message || !$errors){
            modalOpen=false;
         }
      },
      delayMs: 500,
      timeoutMs: 8000,
   });
   export const snapshot = {
      capture,
      restore,
   }
</script>
<div class={classes}>
   <FormMessage message={$message} />
   <form action="/forms/onboardingCreateManyInvoicesForm" method="POST" use:enhance>   
      <DatePickerSingle
         value={$form.startingDate}
         errors={$errors.startingDate}
         constraints={$constraints.startingDate}
         label='Create invoices starting from'
         name='startingDate'
      />
      <DatePickerSingle
         value={$form.endingDate}
         errors={$errors.endingDate}
         constraints={$constraints.endingDate}
         label='Create invoices to'
         name='endingDate'
      />
      <input type="hidden" name="leaseId" value={lease.leaseId} />
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} />
   </form>
</div>