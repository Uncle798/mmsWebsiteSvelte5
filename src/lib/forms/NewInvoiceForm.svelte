<script lang='ts'>
	import LeaseEmployee from "$lib/displayComponents/LeaseEmployee.svelte";
   import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import NumberInput from "$lib/formComponents/NumberInput.svelte";
	import TextInput from "$lib/formComponents/TextInput.svelte";
   import type { NewInvoiceFormSchema } from "$lib/formSchemas/schemas";
	import type { PartialUser } from "$lib/server/partialTypes";
	import type { Lease } from "@prisma/client";
	import type { SuperValidated, Infer } from "sveltekit-superforms";
   import { superForm } from "sveltekit-superforms";

   interface Props {
      data: SuperValidated<Infer<NewInvoiceFormSchema>>;
      employeeId: string | undefined;
      customers: PartialUser[];
      leases: Lease[];
   }
   let { data, employeeId, customers, leases }:Props = $props();
   let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data, {

});
</script>

<FormMessage message={$message} />

<form action="/forms/newInvoiceForm" method="POST" use:enhance>
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
   <input type="hidden" name='employeeId' value={employeeId}/>
   <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText='Create Invoice'/>
</form>