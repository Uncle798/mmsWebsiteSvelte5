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

   import { Combobox, Modal, Switch } from "@skeletonlabs/skeleton-svelte";
	import dayjs from "dayjs";

   interface Props {
      data: SuperValidated<Infer<NewInvoiceFormSchema>>;
      employeeId: string | undefined;
      customers: PartialUser[];
      leases: Lease[];
      defaultCustomer?: string;
   }
   let { data, employeeId, customers, leases, defaultCustomer='' }:Props = $props();
   let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data, {
      onSubmit({formData}) {
         formData.set('customerId', selectedCustomer[0])
         formData.set('leaseId', selectedLease[0])
      },
   });
   let selectedCustomer = $state([defaultCustomer]);
   let selectedLease = $state(['']);
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
   let leaseSelected = $state(false)
</script>


 
<FormMessage message={$message} />

<form action="/forms/newInvoiceForm" method="POST" use:enhance>

   <Combobox
      data={customerComboBoxData}
      bind:value={selectedCustomer}
      label='Select Customer'
      placeholder='Select...'
      openOnClick={true}
      classes=''
   />
   {#if leaseComboBoxData.length > 0 }
      <Combobox
         data={leaseComboBoxData.sort()}
         bind:value={selectedLease}
         label="Select a unit"
         placeholder="Select..."
         openOnClick={true}
         onValueChange={(details) =>{
            const lease = leases.find((lease) => lease.leaseId === details.value[0]);
            if(lease){
               $form.invoiceAmount=lease.price
               const date = dayjs(new Date()).format('M/YYYY')
               $form.invoiceNotes=`Rent for Unit Number ${lease.unitNum.replace(/^0+/gm,'')} for ${date}`
            }
            leaseSelected = true
         }}
      />
   {/if}
   {#if leaseSelected}
   <TextInput
      bind:value={$form.invoiceNotes}
      errors={$errors.invoiceNotes}
      constraints={$constraints.invoiceNotes}
      label="Invoice notes"
      name='invoiceNotes'
   />
   <NumberInput
      bind:value={$form.invoiceAmount}
      errors={$errors.invoiceAmount}
      constraints={$constraints.invoiceAmount}
      label='Invoice amount: $'
      name='invoiceAmount'
   />
   <div class="card m-4">
      <label for="depost">Deposit
         <Switch name='deposit' bind:checked={$form.deposit} label='Deposit'/>
      </label>
   </div>
   <input type="hidden" name='employeeId' value={employeeId}/>
   <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText='Create Invoice'/>
   {/if}
</form>