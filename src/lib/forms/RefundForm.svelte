<script lang="ts">
	import type { Infer, SuperValidated } from "sveltekit-superforms";
   import type { RefundFormSchema } from "$lib/formSchemas/schemas";
   import { superForm } from "sveltekit-superforms";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
   import { Tipex } from '@friendofsvelte/tipex'
	import NumberInput from "$lib/formComponents/NumberInput.svelte";
	import { onMount } from "svelte";
   interface Props {
      data: SuperValidated<Infer<RefundFormSchema>>;
      refundFormModalOpen: boolean;
      notes: string;
      amount: number;
      paymentRecordNumber: number;
   }
   let {
      data,
      refundFormModalOpen = $bindable(false),
      notes = $bindable('Note'),
      amount = $bindable(0),
      paymentRecordNumber = $bindable(0)
   } = $props();
   let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data, {
      onSubmit(input) {
         input.formData.set('notes', notes)
      },
      
      onUpdate(){
         refundFormModalOpen = false;
      }
   });
   onMount(()=>{
      $form.amount = amount;
   })
</script>

<FormMessage message={$message} />

<form action="/forms/refundForm" method="post" use:enhance>
   <Tipex body={notes} floating controls
      class='input'
   />
   <NumberInput
      bind:value={$form.amount}
      errors={$errors.amount}
      constraints={$constraints.amount}
      label='Refund amount'
      name='amount'
   />
   <select name="refundType" id="" bind:value={$form.refundType}>
      {#each ['Stripe', 'Cash', 'Check'] as type}
         <option value={type}>{type}</option>
      {/each}
   </select>
   <input type="hidden" name="paymentRecordNumber" value={paymentRecordNumber}>
   <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText="Submit Refund"/>
</form>