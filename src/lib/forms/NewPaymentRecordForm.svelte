<script lang="ts">
   import type { SuperValidated, Infer } from "sveltekit-superforms";
   import type { Lease, User, } from "@prisma/client";
   import type { EmailVerificationFormSchema, NewInvoiceFormSchema, NewPaymentRecordFormSchema, RegisterFormSchema} from "$lib/formSchemas/schemas";
   import { superForm } from "sveltekit-superforms";
   import { Combobox, Modal, Switch } from "@skeletonlabs/skeleton-svelte";
   import FormMessage from "$lib/formComponents/FormMessage.svelte";
   import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
   import NumberInput from "$lib/formComponents/NumberInput.svelte";
   import TextInput from "$lib/formComponents/TextInput.svelte";
   import type { Invoice } from "@prisma/client";
	import NewInvoiceForm from "./NewInvoiceForm.svelte";
	import { onMount } from "svelte";
	import TextArea from "$lib/formComponents/TextArea.svelte";
	import RadioButton from "$lib/formComponents/RadioButton.svelte";
	import ExplainerModal from "$lib/demo/ExplainerModal.svelte";
	import UserEmployee from "$lib/displayComponents/UserEmployee.svelte";
	import InvoiceEmployee from "$lib/displayComponents/InvoiceEmployee.svelte";
   import RegisterForm from "./RegisterForm.svelte";

   interface Props {
      data: SuperValidated<Infer<NewPaymentRecordFormSchema>>;
      invoiceForm: SuperValidated<Infer<NewInvoiceFormSchema>>;
      registerForm: SuperValidated<Infer<RegisterFormSchema>>;
      emailVerificationFormData: SuperValidated<Infer<EmailVerificationFormSchema>>;
      employeeId: string | undefined;
      customers?: User[];
      customer?: User;
      invoices?: Invoice[];
      customerInvoices?: Invoice[];
      invoice?: Invoice;
      leases?: Lease[];
      classes?: string;
   }
   let { data, employeeId, customers, invoices,  invoiceForm, registerForm, emailVerificationFormData, leases, customer, customerInvoices, invoice, classes, }:Props = $props();
   let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data, {
      onSubmit({formData}) {
         formData.set('customerId', selectedCustomer[0]);
         formData.set('invoiceNum', selectedInvoice[0]);

      },
   });
   let selectedCustomer = $state<string[]>(['']);
   let selectedInvoice = $state<string[]>([''])
   interface ComboBoxData {
      label: string;
      value: string;
   } 
   const customersComboBoxData:ComboBoxData[] = [];
   const invoicesComboboxData:ComboBoxData[] = [];
   const customerInvoicesData:ComboBoxData[] =[];
   let invoiceFormOpen=$state(false);
   onMount(()=>{
      if(invoice){
         selectedInvoice[0] = invoice.invoiceNum.toString()
      }
      if(customer){
         selectedCustomer[0] = customer.id
      }
      if(invoices){
         for(const invoice of invoices){
            const label = `Number ${invoice.invoiceNum} ${invoice.invoiceNotes}`
            const value = invoice.invoiceNum.toString()
            invoicesComboboxData.push({label, value})
         }
      }
      if(customers){
         for(const customer of customers){
            const label = `${customer.givenName} ${customer.familyName}`;
            const value = customer.id;
            const datum = {
               label,
               value
            }
            customersComboBoxData.push(datum);
            $inspect(customersComboBoxData)
         };
      }
      if(customerInvoices){
         for(const invoice of customerInvoices){
            const label = `Num ${invoice.invoiceNum} ${invoice.invoiceNotes}`
            const value = invoice.invoiceNum.toString();
            customerInvoicesData.push({label, value});
         }
      }
      setTimeout(()=>{explainerModalOpen = false}, 4000)
   })
   let explainerModalOpen = $state(true);
   const paymentTypes = [ 'CASH', 'CHECK', 'CREDIT'];
   let registerFormModalOpen = $state(false);
</script>
<ExplainerModal
   bind:modalOpen={explainerModalOpen}
>
   {#snippet copy()}
      Please choose Cash or Check for the demo. Credit card just means you have to enter a bunch of numbers.
   {/snippet}
</ExplainerModal>
{#if leases}
<Modal
   open={invoiceFormOpen}
   onOpenChange={(e) => invoiceFormOpen = e.open}
   contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-(--breakpoint-sm)"
   backdropClasses="backdrop-blur-xs"
>
   {#snippet content()}
      <NewInvoiceForm 
         data={invoiceForm} 
         customers={customers} 
         employeeId={employeeId} 
         leases={leases}
         customer={customer}
         registerFormData={registerForm}
         emailVerificationFormData={emailVerificationFormData}
      />
      <button class="btn" onclick={()=>invoiceFormOpen=false}>Cancel</button>
   {/snippet}
</Modal>
{/if}
Hello
<div class={classes}>
   <FormMessage message={$message} />
   <form action="/forms/newPaymentRecordForm" method="POST" use:enhance>
      {#if invoice}
         <InvoiceEmployee {invoice} />
      {:else}
         <Combobox
            data={invoicesComboboxData}
            openOnClick={true}
            name='invoicesSelect'
            label='Select invoice'
            placeholder='Select...'
            onValueChange={(details) => {
               selectedInvoice = details.value
            }}
         />
      {/if}
      {#if customer}
         <UserEmployee user={customer} />
       {:else if customers}
         <Combobox
            data={customersComboBoxData}
            openOnClick={true}
            name='customerSelect'
            label='Select customer'
            placeholder='Select...'
            onValueChange={(details) => {
               selectedCustomer = details.value
            }}
         />
      {/if}
      {#if selectedCustomer[0] !== '' && customerInvoices}
         <Combobox
            data={customerInvoicesData}
            openOnClick={true}
            name='customerInvoiceSelect'
            label='Select Invoice'
            placeholder='Select...'
            onValueChange={(details) => {
               selectedInvoice = details.value
            }}
         />
      {/if}
      {#if selectedInvoice[0] !== ''}
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
         <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} />
      {/if}
   </form>
</div>