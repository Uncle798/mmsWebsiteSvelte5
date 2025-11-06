<script lang='ts'>
	import ExplainerModal from "$lib/displayComponents/Modals/ExplainerModal.svelte";
	import type { EmailVerificationFormSchema, NewInvoiceFormSchema, NewPaymentRecordFormSchema, RegisterFormSchema } from "$lib/formSchemas/schemas";
	import type { Invoice, Lease, User } from "@prisma/client";
	import { onMount } from "svelte";
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
   import NewInvoiceForm from "./NewInvoiceForm.svelte";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import { goto, onNavigate } from "$app/navigation";
   import TextInput from "$lib/formComponents/TextInput.svelte";
   import NumberInput from "$lib/formComponents/NumberInput.svelte";
	import TextArea from "$lib/formComponents/TextArea.svelte";
	import RadioButton from "$lib/formComponents/RadioButton.svelte";
   import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
   import FormModal from "$lib/displayComponents/Modals/FormModal.svelte";
   import Combobox from "$lib/formComponents/Combobox.svelte";
	import ProgressRing from "$lib/displayComponents/ProgressRing.svelte";
	import ProgressLine from "$lib/displayComponents/ProgressLine.svelte";
   import Switch from "$lib/formComponents/Switch.svelte";
	import { driver } from "driver.js";
   import 'driver.js/dist/driver.css';

   interface Props {
      data: SuperValidated<Infer<NewPaymentRecordFormSchema>>;
      invoiceFormData: SuperValidated<Infer<NewInvoiceFormSchema>>;
      registerFormData: SuperValidated<Infer<RegisterFormSchema>>;
      emailVerificationFormData: SuperValidated<Infer<EmailVerificationFormSchema>>;
      employeeId: string;
      customers?: User[];
      customer?: User;
      invoices?: Invoice[];
      invoice?: Invoice;
      leases?: Lease[];
      classes?: string;
      paymentTypesCookie?: string;
      newPaymentsCookie?: string;
   }
   let { 
      data, 
      invoiceFormData,
      registerFormData,
      emailVerificationFormData,
      employeeId, 
      customers, 
      customer, 
      invoices, 
      invoice, 
      leases, 
      paymentTypesCookie,
      newPaymentsCookie,
      classes
   }:Props = $props();
   let { form, enhance, errors, message, constraints, delayed, timeout, capture, restore} = superForm(data, {
      onChange(event) {
         if(event.target){
            const formName = 'newPaymentRecordForm'
            const value = event.get(event.path);
            console.log(value);
            if(value && value !== ''){
               sessionStorage.setItem(`${formName}/invoiceNum=${invoice?.invoiceNum}:${event.path}`, value.toString());
            } else if(value === ''){
               sessionStorage.removeItem(`${formName}/invoiceNum=${invoice?.invoiceNum}:${event.path}`)
            } else if(value === false){
               sessionStorage.removeItem(`${formName}/invoiceNum=${invoice?.invoiceNum}:${event.path}`)
            }
         }
      },
   })
   export const snapshot = {
      capture, 
      restore,
   }
   interface ComboBoxData {
      label: string;
      value: string;
   } 
   const customersComboBoxData:ComboBoxData[] | undefined = $derived(customers?.map(customer => ({
      label: `${customer.givenName} ${customer.familyName} (${customer.email})`,
      value: customer.id
   })));
   const invoicesComboboxData:ComboBoxData[] | undefined = $derived(invoices?.map(invoice =>{
      const customer = customers?.find((customer) => customer.id === invoice.customerId)
      if(customer){
         return {
            label: `Number ${invoice.invoiceNum} ${invoice.invoiceNotes} (${customer.organizationName? customer.organizationName : customer.givenName + ' ' + customer.familyName})`,
            value: invoice.invoiceNum.toString()
         }
      } else {
         return {
            label: `Number ${invoice.invoiceNum} ${invoice.invoiceNotes}`,
            value: invoice.invoiceNum.toString()
         }
      }
   }));
   let invoiceModalOpen = $state(false);
   let explainerModalOpen = $state(false);
   onNavigate(() => {
      navDelayed = false;
      navTimeout = false;
   })
   onMount(() => {
      for(const key in $form){
         const fullKey = `newPaymentRecordForm/invoiceNum=${invoice?.invoiceNum}:${key}`;
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
      if(invoice){
         $form.paymentAmount = invoice.invoiceAmount - invoice?.amountPaid;
      }
   })
   const paymentTypes = [ 'CASH', 'CHECK', 'CREDIT'];
   let navDelayed = $state(false);
   let navTimeout = $state(false);
   let formTour = driver({
      showProgress: true,
      stagePadding: 2,
      steps: [
         { popover: { title: `Take a payment`, description: `Here's where you take in person or over the phone payments. To take a payment you'll need an invoice first.`}},
         { element: '.paymentNotes', popover: { title: `Payment Notes`, description: `Here is where to enter any notes for the payment, they will be visible to the customer. MMS has defaults that we can customize for you, and you can edit the notes before making the payment record.`}}
      ],
      onDestroyed: () => {
         fetch('/api/demoSetCookie?demoPage=newPayment');
      }
   });
   onMount(() =>{
      console.log('paymentTypesCookie', paymentTypesCookie)
      if(paymentTypesCookie !== 'true'){
         formTour = driver({
            showProgress: true,
            stagePadding: 2,
            steps: [
               { popover: { title: `Take a payment`, description: `Here's where you take in person or over the phone payments. To take a payment you'll need an invoice first.`}},
               { element: '.paymentNotes', popover: { title: `Payment Notes`, description: `Here is where to enter any notes for the payment, they will be visible to the customer. MMS has defaults that we can customize for you, and you can edit the notes before making the payment record.`}},
               { element: '.paymentTypes', popover: { title: `Payment Types`, description: `Please chose cash or check as there is currently no way to demo a credit card payment.`}}
            ],
            onDestroyed: () => {
               fetch('/api/demoSetCookie?demoPage=paymentTypes');
            }
         });
      }
   })
</script>

<FormModal
   modalOpen={invoiceModalOpen}
>
   {#snippet content()}    
      <NewInvoiceForm 
         data={invoiceFormData} 
         employeeId={employeeId} 
         leases={leases}
         customers={customers} 
         customer={customer}
         registerFormData={registerFormData}
         emailVerificationFormData={emailVerificationFormData}
      />
      <button class="btn" onclick={()=>invoiceModalOpen=false}>Cancel</button>
   {/snippet}
</FormModal>

<div class={classes} >
   <FormMessage message={$message} />
   {#if invoicesComboboxData}
      <div class="flex flex-row w-screen">
         <Combobox
            data={invoicesComboboxData}
            label="Select Invoice"
            placeholder="Type or Select..."
            onValueChange={(details) => {
               setTimeout(() => {
                  navDelayed = true;
               }, 300);
               goto(`/paymentRecords/new?invoiceNum=${details.value}`)
            }}
         />
         {#if navDelayed}
            <ProgressRing value={null} />
         {/if}
         {#if navTimeout}
            <ProgressLine value={null} />
         {/if}
      </div>
      <p>or,</p>
      <button type="button" onclick={()=>invoiceModalOpen=true} class='btn preset-filled-primary-50-950'>Create Invoice</button>
   {/if}
   {#if invoice}  
      <form action="/forms/newPaymentRecordForm" method="POST" use:enhance {@attach ()=> {
         explainerModalOpen=true;
         $form.invoiceNum=invoice.invoiceNum;
         $form.paymentNotes=`Payment for Invoice ${invoice.invoiceNum} ${invoice.invoiceNotes}`
         $form.paymentAmount=invoice.invoiceAmount - invoice.amountPaid;
         $form.deposit=invoice.deposit;
         if(newPaymentsCookie !== 'true'){
            formTour.drive()
         }
      }}>
         <NumberInput
            bind:value={$form.paymentAmount}
            errors={$errors.paymentAmount}
            constraints={$constraints.paymentAmount}
            label='Payment amount: $'
            name='paymentAmount'
         />
         <div class="flex paymentTypes">
            {#each paymentTypes as paymentType}
               {#if paymentType === 'CREDIT'}
                  <RadioButton
                     value={paymentType}
                     groupName='paymentType'
                     id={paymentType}
                     errors={$errors.paymentType}
                     constraints={$constraints.paymentType}
                     label={paymentType.substring(0,1)+paymentType.substring(1).toLowerCase()}
                     disabled={true}
                  />
               {:else}
                  <RadioButton
                     value={paymentType}
                     groupName='paymentType'
                     id={paymentType}
                     errors={$errors.paymentType}
                     constraints={$constraints.paymentType}
                     label={paymentType.substring(0,1)+paymentType.substring(1).toLowerCase()}
                  />
               {/if}
            {/each}
         </div>
         <input type="hidden" name='employeeId' value={employeeId} />
         <TextArea
            bind:value={$form.paymentNotes}
            errors={$errors.paymentNotes}
            constraints={$constraints.paymentNotes}
            label='Payment Notes'
            name='paymentNotes'
            rows={2}
            classes='paymentNotes'
         />
         <div class="card p-4">
            <Switch bind:checked={$form.deposit} name='deposit' label='Deposit' />
         </div>
         <TextInput
            bind:value={$form.payee}
            errors={$errors.payee}
            constraints={$constraints.payee}
            label='Payee (if different than customer)'
            name='payee'
         />
         <input type="hidden" name="invoiceNum" id="invoiceNum" value={invoice.invoiceNum}>
         <input type="hidden" name="customerId" id="customerId" value={customer?.id}>
         <input type="hidden" name="employeeId" id="employeeId" value={employeeId}>
         <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} />
      </form>
   {/if}
</div>