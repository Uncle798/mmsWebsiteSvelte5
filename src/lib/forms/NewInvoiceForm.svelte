<script lang='ts'>
	import LeaseEmployee from "$lib/displayComponents/LeaseEmployee.svelte";
   import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import NumberInput from "$lib/formComponents/NumberInput.svelte";
	import TextInput from "$lib/formComponents/TextInput.svelte";
   import type { NewInvoiceFormSchema, RegisterFormSchema } from "$lib/formSchemas/schemas";
	import type { PartialUser } from "$lib/server/partialTypes";
	import type { Lease } from "@prisma/client";
	import type { SuperValidated, Infer } from "sveltekit-superforms";
   import { superForm } from "sveltekit-superforms";
   import { Combobox, Modal } from "@skeletonlabs/skeleton-svelte";
	import RegisterForm from "./RegisterForm.svelte";

   interface Props {
      data: SuperValidated<Infer<NewInvoiceFormSchema>>;
      registerForm: SuperValidated<Infer<RegisterFormSchema>>;
      employeeId: string | undefined;
      customers: PartialUser[];
      leases: Lease[];
   }
   let { data, employeeId, customers, leases, registerForm }:Props = $props();
   let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data, {
      onSubmit({formData}) {
         formData.set('customerId', selectedCustomer[0])
         formData.set('leaseId', selectedLease[0])
      },
   });
   let selectedCustomer = $state(['']);
   let selectedLease = $state([''])
   interface ComboBoxData {
      label: string;
      value: string;
   }
   const customerComboBoxData:ComboBoxData[] = [];
   const leaseComboBoxData:ComboBoxData[] = $derived.by(() =>{
      const customerLeases = leases.filter((lease) => lease.customerId === selectedCustomer[0]);
      const data:ComboBoxData[]=[]
      customerLeases.forEach((lease) =>{
         const label = lease.unitNum.replace(/^0+/gm,'');
         const value = lease.leaseId;
         data.push({label, value})
      })
      return data
   })
   customers.forEach((customer)=>{
      const label = `${customer.givenName} ${customer.familyName}`;
      const value = customer.id;
      const datum = {
         label,
         value
      }
      customerComboBoxData.push(datum);
   });
   let registerFormOpen=$state(false)
</script>

<Modal
   bind:open={registerFormOpen}
   triggerBase="btn preset-tonal"
   contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
   backdropClasses="backdrop-blur-sm"
>
   {#snippet content()}
   <RegisterForm data={registerForm} registerFormModalOpen={registerFormOpen} formType='employee'/>
   <button class="btn" onclick={()=>registerFormOpen=false}>Cancel</button>
   {/snippet}

</Modal>
 
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
   <button class="btn p-4" onclick={()=> registerFormOpen=true } type='button'>Create new customer</button>
   {#if leaseComboBoxData.length > 0 }
      <Combobox
         data={leaseComboBoxData.sort()}
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