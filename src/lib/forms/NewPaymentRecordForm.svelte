<script lang='ts'>
	import ExplainerModal from "$lib/demo/ExplainerModal.svelte";
	import type { EmailVerificationFormSchema, NewInvoiceFormSchema, NewPaymentRecordFormSchema, RegisterFormSchema } from "$lib/formSchemas/schemas";
	import type { Invoice, Lease, User } from "@prisma/client";
	import { Combobox, Modal, Switch } from "@skeletonlabs/skeleton-svelte";
	import { onMount } from "svelte";
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
   import NewInvoiceForm from "./NewInvoiceForm.svelte";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import { goto } from "$app/navigation";
   import TextInput from "$lib/formComponents/TextInput.svelte";
   import NumberInput from "$lib/formComponents/NumberInput.svelte";
	import TextArea from "$lib/formComponents/TextArea.svelte";
	import RadioButton from "$lib/formComponents/RadioButton.svelte";
   import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";

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
      classes
   }:Props = $props();
   let { form, enhance, errors, message, constraints, delayed, timeout, capture, restore} = superForm(data, {
      onChange(event) {
         if(event.target){
            const formName = 'newPaymentRecordForm'
            const value = event.get(event.path);
            if(value){
               sessionStorage.setItem(`${formName}:${event.path}`, value.toString());
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
   const invoicesComboboxData:ComboBoxData[] | undefined = $derived(invoices?.map(invoice =>({
      label: `Number ${invoice.invoiceNum} ${invoice.invoiceNotes}`,
      value: invoice.invoiceNum.toString()
   })));
   let invoiceModalOpen = $state(false);
   let explainerModalOpen = $state(false);
   onMount(() => {
      for(const key in $form){
         const fullKey = `newPaymentRecordForm:${key}`;
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
   })
   const paymentTypes = [ 'CASH', 'CHECK', 'CREDIT'];
   $inspect($form.paymentNotes);
</script>
<ExplainerModal
   bind:modalOpen={explainerModalOpen}
>
   {#snippet copy()}
      Please choose Cash or Check for the demo. There is currently no way to demo credit card payments.
   {/snippet}
</ExplainerModal>
<Modal
   open={invoiceModalOpen}
   onOpenChange={(e) => invoiceModalOpen = e.open}
   contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl"
   backdropClasses="backdrop-blur-xs"
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
</Modal>
<div class={classes} >
   <FormMessage message={$message} />
   {#if invoicesComboboxData}  
      <Combobox
         data={invoicesComboboxData}
         openOnClick={true}
         label="Select Invoice"
         placeholder="Type or Select..."
         onValueChange={(details) => {
            goto(`/paymentRecords/new?invoiceNum=${details.value}`)
         }}
         optionClasses='truncate'
      />
      <p>or,</p>
      <button type="button" onclick={()=>invoiceModalOpen=true} class='btn preset-filled-primary-50-950'>Create Invoice</button>
   {/if}
   {#if invoice}  
      <form action="/forms/newPaymentRecordForm" method="POST" use:enhance {@attach ()=> {
         $inspect.trace('{@attach} trace');
         explainerModalOpen=true;
         $form.invoiceNum=invoice.invoiceNum;
         $form.paymentNotes=`Payment for Invoice ${invoice.invoiceNum} ${invoice.invoiceNotes}`
         $form.paymentAmount=invoice.invoiceAmount;
         $form.deposit=invoice.deposit;
         setTimeout(()=>{explainerModalOpen=false}, 5000);
      }}>
         <NumberInput
            bind:value={$form.paymentAmount}
            errors={$errors.paymentAmount}
            constraints={$constraints.paymentAmount}
            label='Payment amount: $'
            name='paymentAmount'
         />
         <div class="flex">
            {#each paymentTypes as paymentType}
               <RadioButton
                  value={paymentType}
                  groupName='paymentType'
                  id={paymentType}
                  errors={$errors.paymentType}
                  constraints={$constraints.paymentType}
                  label={paymentType.substring(0,1)+paymentType.substring(1).toLowerCase()}
               />
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
         />
         <div class="card p-4">
            <Switch checked={$form.deposit} onCheckedChange={(e) => $form.deposit = e.checked} name='deposit'>
               Deposit
            </Switch>
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