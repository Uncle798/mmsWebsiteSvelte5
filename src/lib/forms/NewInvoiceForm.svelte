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
   import { Combobox } from "@skeletonlabs/skeleton-svelte";

   interface Props {
      data: SuperValidated<Infer<NewInvoiceFormSchema>>;
      employeeId: string | undefined;
      customers: PartialUser[];
      leases: Lease[];
   }
   let { data, employeeId, customers, leases }:Props = $props();
   let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data, {
   });
   let selectedCustomer = $state(['']);
   let selectedLease = $state([''])
   interface ComboBoxData {
      label: string;
      value: string;
   }
   const customerComboBoxData:ComboBoxData[] = [];
   const leaseComboBoxData:ComboBoxData[] = []
   customers.forEach((customer)=>{
      const label = `${customer.givenName} ${customer.familyName}`;
      const value = customer.id;
      const datum = {
         label,
         value
      }
      customerComboBoxData.push(datum);
      const customerLeases = leases.filter((lease) => { lease.customerId === customer.id});
      console.log(customerLeases)
   })

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
   <Combobox
      data={customerComboBoxData}
      bind:value={selectedCustomer}
      label='Select Customer'
      placeholder='Select...'
   />
   {#if leaseComboBoxData.length > 0 }
      <Combobox
         data={leaseComboBoxData}
         bind:value={selectedLease}
         label="Select a unit"
         placeholder="Select..."
      />
   {/if}
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