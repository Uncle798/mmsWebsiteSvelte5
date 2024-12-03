<script lang='ts'>
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import NumberInput from "$lib/formComponents/NumberInput.svelte";
	import TextInput from "$lib/formComponents/TextInput.svelte";
import type { NewInvoiceFormSchema } from "$lib/formSchemas/schemas";
	import type { PartialUser } from "$lib/server/partialTypes";
	import type { SuperValidated, Infer } from "sveltekit-superforms";
   import { superForm } from "sveltekit-superforms";

   interface Props {
      data: SuperValidated<Infer<NewInvoiceFormSchema>>;
      employeeId: string | undefined;
      customers: PartialUser[]
   }
   let { data, employeeId, customers }:Props = $props();
   let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data, {

});
</script>

<FormMessage message={$message} />

<form action="/forms/newInvoice" method="POST" use:enhance>
   <NumberInput
      bind:value={$form.invoiceAmount}
      errors={$errors.invoiceAmount}
      constraints={$constraints.invoiceAmount}
      label='Invoice amount: $'
      name='invoiceAmount'
   />
   <label for="customerId">Customer: 
      <select class="select" name='customerId' bind:value={$form.customerId}>
         {#each customers as customer}
         <option value={customer.id}>{customer.givenName} {customer.familyName}</option>
         {/each}
      </select>
   </label>
   <TextInput
      bind:value={$form.invoiceNotes}
      errors={$errors.invoiceNotes}
      constraints={$constraints.invoiceNotes}
      label="Invoice notes"
      name='invoiceNotes'
   />
   <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} />
</form>