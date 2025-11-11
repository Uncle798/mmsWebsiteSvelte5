<script lang="ts">
	import type { NewInvoiceFormSchema } from "$lib/formSchemas/newInvoiceFormSchema";
	import type { EmailVerificationFormSchema } from '$lib/formSchemas/emailVerificationFormSchema';
	import type { RegisterFormSchema } from '$lib/formSchemas/registerFormSchema';
	import type { Lease, User } from "@prisma/client";
	import { onMount } from "svelte";
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
	import EmailVerificationForm from "./EmailVerificationForm.svelte";
	import RegisterForm from "./RegisterForm.svelte";
	import Header from "$lib/Header.svelte";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
   import NumberInput from "$lib/formComponents/NumberInput.svelte";
   import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import { goto, onNavigate } from "$app/navigation";
	import { Info } from "lucide-svelte";
	import dayjs from "dayjs";
	import { page } from "$app/state";
   import FormModal from "$lib/displayComponents/Modals/FormModal.svelte";
   import Combobox from "$lib/formComponents/Combobox.svelte";
	import ProgressRing from "$lib/displayComponents/ProgressRing.svelte";
	import ProgressLine from "$lib/displayComponents/ProgressLine.svelte";
   import Switch from "$lib/formComponents/Switch.svelte";
	import { Portal, Tooltip, useTooltip } from "@skeletonlabs/skeleton-svelte";
	import TextArea from "$lib/formComponents/TextArea.svelte";
	import DatePickerSingle from "$lib/formComponents/DatePickerSingle.svelte";
   
   interface Props {
      data: SuperValidated<Infer<NewInvoiceFormSchema>>;
      registerFormData: SuperValidated<Infer<RegisterFormSchema>>;
      emailVerificationFormData: SuperValidated<Infer<EmailVerificationFormSchema>>;
      employeeId: string;
      customers?: User[];
      customer?: User;
      leases?: Lease[];
      lease?: Lease;
      classes?: string;
   }
   let {
      data,
      registerFormData,
      emailVerificationFormData,
      employeeId,
      customers,
      customer,
      leases, 
      lease, 
      classes,
   }:Props = $props();
   let url = page.url.pathname
   let { form, errors, message, constraints, enhance, delayed, timeout, } = superForm(data, {
      onChange(event) {
         if(event.target){
            const formName = `${url}/newInvoiceForm/${customer?.id ? `customerId=${customer.id}` : undefined}${lease?.unitNum ? `&unitNum:${lease.unitNum}` : undefined}:${event.path}`
            const value = event.get(event.path);
            if(value){
               sessionStorage.setItem(formName, value.toString());
            }
         }
      },
   });
   interface ComboboxData {
      label: string;
      value: string;
   }
   const customersComboboxData:ComboboxData[] | undefined= $derived(customers?.map(customer => ({
      label: `${customer.givenName} ${customer.familyName} (${customer.email})`,
      value: customer.id
   })));
   const leasesComboboxData:ComboboxData[] | undefined = $derived(leases?.map(lease => ({
      label: lease.unitNum.replace(/^0+/gm, ''),
      value: lease.leaseId
   })));
   const id = $props.id();
   const tooltip = useTooltip({id})
   let registerFormModalOpen = $state(false);
   onMount(()=>{
      $form.invoiceDue=new Date();
      for(const key in $form){
         const fullKey = `newInvoiceForm:${key}`;
         const storedValue = sessionStorage.getItem(fullKey);
         if(storedValue){
            if(isNaN(parseInt(storedValue, 10))){
               if(storedValue === 'true'){
                  $form[key as keyof typeof $form] = true as never;
               } else if(storedValue === 'false'){
                  $form[key as keyof typeof $form] = false as never;
               } else {
                  $form[key as keyof typeof $form] = storedValue as never;
               }
            } else {
               $form[key as keyof typeof $form] = parseInt(storedValue, 10) as never;
            }
         }
      }
      if(lease){
         $form.invoiceAmount=lease.price;
         $form.invoiceNotes=`Rent for unit ${lease.unitNum.replace(/^0+/gm, '')} for ${dayjs().format('MMMM YYYY')}`;
      }
      if(customer){
         $form.customerId=customer.id;
      }
   })
   let navDelayed = $state(false);
   let navTimeout = $state(false);
   let navReason = $state('');
   onNavigate(() =>{
      navDelayed = false;
      navTimeout = false;
      navReason = '';
   })
</script>
<FormModal
   bind:modalOpen={registerFormModalOpen}
>
   {#snippet content()}
      {#if customer}
         <EmailVerificationForm data={emailVerificationFormData} userId={customer.id} redirect='false' bind:emailVerificationModalOpen={registerFormModalOpen} />
      {:else}
         <RegisterForm data={registerFormData} bind:registerFormModalOpen={registerFormModalOpen} formType='employee' redirectTo='invoices/new' />
      {/if}
   {/snippet}
</FormModal>

<Header title='New Invoice' />
<FormMessage message={$message} />
<div class={classes}>
   {#if !customer}
      <button class="btn preset-filled-primary-50-950 my-2" onclick={() => registerFormModalOpen = true}>Create new customer</button>
      or,
      <div class="flex flex-row">
         {#if customersComboboxData}
            <Combobox
               data={customersComboboxData}
               label='Select Customer'
               placeholder='Type or select...'
               onValueChange={(details) => {
                  navReason = 'customersComboBoxData'
                  setTimeout(() =>{
                     navDelayed = true
                  }, 300)
                  goto(`/invoices/new?userId=${details.value}`);
               }}
               classes='w-lg'
            />
            {#if navDelayed && navReason === 'customersComboBoxData'}
               <ProgressRing value={null} {@attach () => {
                  setTimeout(() => {
                     navDelayed = false;
                     navTimeout = true;
                  }, 800)
               }}/>
            {/if}
            {#if navTimeout && navReason === 'customersComboBoxData'}
               <ProgressLine value={null} />
            {/if}
         {/if}
      </div>
   {/if}
   {#if leases}
      {#if customer}
         <div class="flex flex-row">
            {#if leasesComboboxData}               
            <Combobox
               data={leasesComboboxData}
               label='Select unit'
               placeholder='Type or select'
               onValueChange={(details) => {
                  setTimeout(() => {
                     navReason = 'leasesComboboxData'
                     navDelayed = true;
                  }, 300)
                  goto(`/invoices/new?leaseId=${details.value}&userId=${customer.id}`);
               }}
               classes='mx-2'
            />
            {/if}
            {#if navDelayed && navReason === 'leasesComboboxData'}
               <ProgressRing value={null} {@attach () => {
                  setTimeout(() => {
                     navDelayed = false;
                     navTimeout = true;
                  }, 800)
               }}/>
            {/if}
            {#if navTimeout && navReason === 'leasesComboboxData'}
               <ProgressLine value={null} />
            {/if}
         </div>        
      {:else}
         <div class="flex flex-row">
            {#if leasesComboboxData}   
               <Combobox
                  data={leasesComboboxData}
                  label='Select unit'
                  placeholder='Type or select'
                  onValueChange={(details) => {
                     setTimeout(() => {
                        navReason = 'leasesComboboxData'
                        navDelayed = true;
                     }, 300)
                     goto(`/invoices/new?leaseId=${details.value}`)
                  }}
               />
               {#if navDelayed && navReason === 'leasesComboboxData'}
                  <ProgressRing value={null} {@attach () => {
                        setTimeout(() => {
                           navDelayed = false;
                           navTimeout = true;
                        }, 800)
                     }}
                  />
               {/if}
               {#if navTimeout && navReason === 'leasesComboboxData'}
                  <ProgressLine value={null} />
               {/if}
            {/if}
         </div>
      {/if}
   {/if}
   {#if customer || lease}
      
      <form action="/forms/newInvoiceForm" class='mx-2' method="POST" use:enhance {@attach () => {
         if(!customer?.emailVerified){
            registerFormModalOpen = true;
         }
      }}>
         <div class="">
            <span class="label-text">Invoice notes
               <Tooltip.Provider value={tooltip}>
                  <Tooltip.Trigger><Info aria-label='Invoice Notes tooltip' size={15} /></Tooltip.Trigger>
                  <Portal>
                     <Tooltip.Positioner>
                        <Tooltip.Content class='card preset-filled p-2 wrap-word max-w-4xl'>
                           Invoice notes are the place to store information for you and your customer. MMS has defaults but those can be edited, and we can change the defaults.
                        </Tooltip.Content>
                     </Tooltip.Positioner>
                  </Portal>
               </Tooltip.Provider>
            </span>
            <TextArea 
               rows={3} 
               name='invoiceNotes' 
               bind:value={$form.invoiceNotes}  
               errors={$errors.invoiceNotes}
               constraints={$constraints.invoiceNotes} 
               label=''  
            />
            {#if $errors.invoiceNotes}<span class="invalid">{$errors.invoiceNotes}</span>{/if}
         </div>
         <NumberInput
            bind:value={$form.invoiceAmount}
            errors={$errors.invoiceAmount}
            constraints={$constraints.invoiceAmount}
            label='Invoice amount $'
            name='invoiceAmount'

         />
         <Switch name='deposit' checked={$form.deposit} label='Deposit' classes='mt-2' />
         <DatePickerSingle 
            bind:value={$form.invoiceDue}
            errors={$errors.invoiceDue}
            constraints={$constraints.invoiceDue}
            minDate={dayjs().subtract(1, 'year').toDate()}
            maxDate={dayjs().add(1, 'year').toDate()}
            name='invoiceDue'
            label='Invoice Due Date'
         />
         <input type="hidden" name='employeeId' value={employeeId}/>
         <input type="hidden" name="customerId" value={customer?.id} />
         <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText='Create Invoice'/>
      </form>
   {/if}
</div>