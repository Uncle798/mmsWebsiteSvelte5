<script lang='ts'>
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import NumberInput from "$lib/formComponents/NumberInput.svelte";
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
   <select class="select" name='customerId' bind:value={$form.customerId}>
      {#each customers as customer}
         <option value={customer.id}>{customer.givenName} {customer.familyName}</option>
      {/each}
   </select>
</form>