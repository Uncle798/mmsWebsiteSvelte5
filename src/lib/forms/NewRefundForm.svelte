<script lang="ts">
	import type { Infer, SuperValidated } from "sveltekit-superforms";
   import type { RefundFormSchema } from "$lib/formSchemas/schemas";
   import { superForm } from "sveltekit-superforms";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import NumberInput from "$lib/formComponents/NumberInput.svelte";
	import { onMount } from "svelte";
	import TextArea from "$lib/formComponents/TextArea.svelte";
	import type { PaymentRecord } from "@prisma/client";
   interface Props {
      data: SuperValidated<Infer<RefundFormSchema>>;
      refundFormModalOpen?: boolean;
      paymentRecord:PaymentRecord;
   }
   let {
      data,
      refundFormModalOpen = $bindable(false),
      paymentRecord
   }:Props = $props();
   let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data, {
      onSubmit(input) {
      },
      
      onUpdate(){
         refundFormModalOpen = false;
      }
   });
   onMount(()=>{
      $form.amount = paymentRecord.paymentAmount;
      $form.notes = `Refund of payment record number: ${paymentRecord.paymentNumber}`
   })
</script>

<FormMessage message={$message} />

<form action="/forms/refundForm" method="post" use:enhance>
   <TextArea 
      bind:value={$form.notes}
      errors={$errors.notes}
      constraints={$constraints.notes}
      label='Refund Notes'
      name='notes'
   />
   <NumberInput
      bind:value={$form.amount}
      errors={$errors.amount}
      constraints={$constraints.amount}
      label='Refund amount'
      name='amount'
   />
   <select name="refundType" bind:value={$form.refundType} class="select m-4">
      {#each ['Stripe', 'Cash', 'Check'] as type}
         <option value={type.toUpperCase()} selected={type.toUpperCase() === paymentRecord.paymentType}>{type}</option>
      {/each}
   </select>
   <input type="hidden" name="paymentRecordNumber" value={paymentRecord.paymentNumber}>
   <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText="Submit Refund"/>
</form>