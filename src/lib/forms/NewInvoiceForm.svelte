<script lang='ts'>
   import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import NumberInput from "$lib/formComponents/NumberInput.svelte";
   import type { NewInvoiceFormSchema, } from "$lib/formSchemas/schemas";
	import type { Lease, User } from "@prisma/client";
	import type { SuperValidated, Infer } from "sveltekit-superforms";
   import { superForm } from "sveltekit-superforms";
   import { Combobox, Switch, } from "@skeletonlabs/skeleton-svelte";
	import dayjs from "dayjs";
	import DateInput from "$lib/formComponents/DateInput.svelte";
	import { onMount } from "svelte";
	import Header from "$lib/Header.svelte";
	import UserEmployee from "$lib/displayComponents/UserEmployee.svelte";
	import LeaseEmployee from "$lib/displayComponents/LeaseEmployee.svelte";
	import ExplainerModal from "$lib/demo/ExplainerModal.svelte";

   interface Props {
      data: SuperValidated<Infer<NewInvoiceFormSchema>>;
      employeeId: string | undefined;
      customers: User[];
      leases: Lease[];
      defaultCustomer?: string;
      classes?: string;
   }
   let { data, employeeId, customers, leases, defaultCustomer='', classes }:Props = $props();
   let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data, {
      onSubmit({formData}) {
         formData.set('customerId', selectedCustomer[0])
         formData.set('leaseId', selectedLease[0])
      },
   });
   onMount(()=> {
      $form.invoiceDue = new Date()
   })
   let selectedCustomer = $state([defaultCustomer]);
   let selectedLease = $state(['']);
   interface ComboBoxData {
      label: string;
      value: string;
   }
   const customerComboBoxData:ComboBoxData[] = [];
   const customerLeaseComboBoxData:ComboBoxData[] = $derived.by(() => {
      const customerLeases = leases.filter((lease) => lease.customerId === selectedCustomer[0]);
      $inspect(customerLeases)
      const data:ComboBoxData[]=[];
      customerLeases.forEach((lease) =>{
         const label = lease.unitNum.replace(/^0+/gm,'');
         const value = lease.leaseId;
         data.push({label, value})
      })
      return data
   })
   let selectedCustomerLease = $state(['']);
   customers.forEach((customer)=>{
      const label = `${customer.givenName} ${customer.familyName}`;
      const value = customer.id;
      const datum = {
         label,
         value
      }
      customerComboBoxData.push(datum);
   });
   const leaseComboBoxData:ComboBoxData[] = [];
   for(const lease of leases){
      const label = lease.unitNum.replace(/^0+/gm, '');
      const value = lease.leaseId;
      leaseComboBoxData.push({
         label,
         value,
      })
   }
   let leaseSelected = $state(false);
   let explainerModalOpen = $state(false);
   let explainerFirstTime = $state(true);
</script>

<Header title='New Invoice' />
<div class={classes}>
   <FormMessage message={$message} />
   <form action="/forms/newInvoiceForm" method="POST" use:enhance>
      {#if !leaseSelected}         
         <Combobox
            data={customerComboBoxData}
            value={selectedCustomer}
            label='Select Customer'
            placeholder='Select...'
            openOnClick={true}
            onValueChange={(detail) => {
               selectedCustomer=detail.value
               if(customerLeaseComboBoxData.length === 0){
                  leaseSelected=true
               }
            }}
         />
         {#if customerLeaseComboBoxData.length === 0}
            or,
            <Combobox
               data={leaseComboBoxData}
               value={selectedLease}
               label='Select Unit'
               placeholder='Select...'
               openOnClick={true}
               onValueChange={(detail) => {
                  selectedLease = detail.value
                  const lease = leases.find((lease) => lease.leaseId === detail.value[0]);
                  console.log(lease)
                  if(lease){
                     selectedCustomer[0] = lease.customerId;
                     $form.invoiceAmount=lease.price
                     const date = dayjs(new Date()).format('MMMM YYYY')
                     $form.invoiceNotes=`Rent for Unit Number ${lease.unitNum.replace(/^0+/gm,'')} for ${date}`
                     leaseSelected = true
                  }
               }}
            />
         {/if}
         {#if customerLeaseComboBoxData.length > 0}
            <Combobox
               data={customerLeaseComboBoxData}
               value={selectedCustomerLease}
               label="Select a unit"
               placeholder="Select..."
               openOnClick={true}
               onValueChange={(details) =>{
                  const lease = leases.find((lease) => lease.leaseId === details.value[0]);
                  if(lease){
                     $form.invoiceAmount=lease.price
                     const date = dayjs(new Date()).format('MMMM YYYY')
                     $form.invoiceNotes=`Rent for Unit Number ${lease.unitNum.replace(/^0+/gm,'')} for ${date}`
                     leaseSelected = true
                  }
               }}
            />
         {/if}
      {/if}
      {#if leaseSelected}
      {@const customer = customers.find((customer) => {
         return customer.id === selectedCustomer[0]
         })}
      {@const lease = leases.find((lease) => lease.leaseId === selectedLease[0])}
         <div class="border border-primary-50-950 rounded-lg ">
            {#if lease}
               <LeaseEmployee {lease} classes='m-2'/>
            {/if}
            {#if customer}
               <UserEmployee user={customer} classes='m-2' />
            {/if}
         </div>
         <ExplainerModal
            modalOpen={explainerModalOpen}
            copy='Invoice notes are your place to keep information. MMS auto generates some but they can be changed, and we can change the defaults'
         />
         <div class="">
            <label class="label ">
                  <span class="label-text">Invoice notes</span>
               <textarea
                  class="input rounded-none h-auto"
                  rows=3
                  name="invoiceNotes"
                  onmouseover={()=>{
                     if(explainerFirstTime){
                        explainerModalOpen=true
                        explainerFirstTime=false
                     }
                  }}
                  {...$constraints.invoiceNotes}
               >{$form.invoiceNotes}</textarea>
            </label>
            {#if $errors.invoiceNotes}<span class="invalid">{$errors.invoiceNotes}</span>{/if}
         </div>
         <NumberInput
            bind:value={$form.invoiceAmount}
            errors={$errors.invoiceAmount}
            constraints={$constraints.invoiceAmount}
            label='Invoice amount: $'
            name='invoiceAmount'

         />
         <Switch name='deposit' checked={$form.deposit} onCheckedChange={(e)=> $form.deposit=e.checked} label='Deposit' classes='mt-2'>
            Deposit
         </Switch>
         <DateInput
            bind:value={$form.invoiceDue}
            errors={$errors.invoiceDue}
            constraints={$constraints.invoiceDue}
            label='Invoice Due Date'
            name='invoiceDue'
            min={dayjs().subtract(1, 'year').toDate()}
            max={dayjs().add(1, 'year').toDate()}
            placeholder={dayjs().format('YYYY/MM/DD')}
         />
         <input type="hidden" name='employeeId' value={employeeId}/>
         <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText='Create Invoice'/>
      {/if}
   </form>
</div>