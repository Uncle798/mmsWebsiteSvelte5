<script lang="ts">
   import type { SuperValidated, Infer } from "sveltekit-superforms";
   import type { Lease, User, } from "@prisma/client";
   import type { NewInvoiceFormSchema, NewPaymentRecordFormSchema, RegisterFormSchema} from "$lib/formSchemas/schemas";
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
      employeeId: string | undefined;
      customers: User[];
      invoices: Invoice[];
      leases: Lease[];
      defaultCustomer?: string | null;
      defaultInvoice?: string | null;
      classes?: string;
   }
   let { data, employeeId, customers, invoices,  invoiceForm, registerForm, leases, defaultCustomer, defaultInvoice, classes, }:Props = $props();
   let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data, {
      onSubmit({formData}) {
         formData.set('customerId', selectedCustomer[0]);
         formData.set('invoiceNum', selectedInvoice[0]);

      },
   });
   let selectedCustomer = $state<string[]>([defaultCustomer ? defaultCustomer : '']);
   let selectedInvoice = $state<string[]>([defaultInvoice ? defaultInvoice : ''])
   interface ComboBoxData {
      label: string;
      value: string;
   } 
   const customerComboBoxData:ComboBoxData[] = [];
   const invoiceComboBoxData:ComboBoxData[] = $derived.by(() =>{
      const customerInvoices = invoices.filter((invoice)=> invoice.customerId === selectedCustomer[0]);
      const data:ComboBoxData[]=[]
      customerInvoices.forEach((invoice) =>{
         const label = invoice.invoiceNotes ? `Invoice ${invoice.invoiceNum} `+invoice.invoiceNotes : `Invoice ${invoice.invoiceNum} `;
         const value = invoice.invoiceNum.toString(10);
         data.push({label, value})
      })
      return data;
   })
   for(const customer of customers){
      const label = `${customer.givenName} ${customer.familyName}`;
      const value = customer.id;
      const datum = {
         label,
         value
      }
      customerComboBoxData.push(datum);
   };
   let invoiceFormOpen=$state(false);
   let invoiceSelected=$state(false);
   onMount(()=>{
      if(defaultInvoice){
         const invoice = invoices.find((invoice) => invoice.invoiceNum.toString() === defaultInvoice)

         if(invoice){
            invoiceSelected = true
            $form.paymentAmount=invoice.invoiceAmount;
            $form.paymentNotes=`Payment for invoice number: ${invoice.invoiceNum}, ${invoice.invoiceNotes}`
            $form.deposit=invoice.deposit;
         }
      }
      setTimeout(()=>{explainerModalOpen = false}, 4000)
   })
   let explainerModalOpen = $state(true);
   const paymentTypes = [ 'CASH', 'CHECK', 'CREDIT'];
   let registerFormModalOpen = $state(false)
</script>

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
         defaultCustomer={selectedCustomer[0]}
      />
      <button class="btn" onclick={()=>invoiceFormOpen=false}>Cancel</button>
   {/snippet}
</Modal>
<ExplainerModal
   bind:modalOpen={explainerModalOpen}
   copy='Please choose Cash or Check for the demo. Credit card just means you have to enter a bunch of numbers.'
/>

<Modal
   open={registerFormModalOpen}
   onOpenChange={(e) => registerFormModalOpen = e.open}
   contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-(--breakpoint-sm)"
   backdropClasses="backdrop-blur-xs"
>
    {#snippet content()}
        <RegisterForm data={registerForm} registerFormModalOpen={registerFormModalOpen} formType='employee'/>
        <button class="btn" onclick={()=>registerFormModalOpen=false}>Cancel</button>
    {/snippet}
</Modal>
<div class={classes}>
   <FormMessage message={$message} />
   <form action="/forms/newPaymentRecordForm" method="POST" use:enhance>
      {#if !defaultCustomer}
         <button class="btn preset-filled-primary-50-950 rounded-lg" type="button" onclick={()=>registerFormModalOpen = true}>Create New Customer</button>
         <span class="label-text">or,</span> 
         <Combobox
            data={customerComboBoxData}
            value={selectedCustomer}
            label='Select Customer'
            placeholder='Select customer...'
            openOnClick={true}
            onValueChange={(details)=>{
               selectedCustomer[0]=details.value[0];
               selectedInvoice[0]=invoiceComboBoxData[0].value;
            }}
         />
      {:else}
      {@const user = customers.find((customer)=> customer.id === selectedCustomer[0])}
         {#if user}
            <UserEmployee {user} />
         {/if}
      {/if}
      <div class="">
         {@debug selectedInvoice}
         {#if selectedInvoice[0] === ''}
            <button class="btn preset-filled-primary-50-950 rounded-lg my-2" onclick={()=>invoiceFormOpen=true} type='button'>Create New Invoice</button>
         {/if}
         {#if invoiceComboBoxData.length > 1 }
            <Combobox
               data={invoiceComboBoxData.sort()}
               value={selectedInvoice}
               label="Select an invoice"
               placeholder="Select..."
               openOnClick={true}
               onValueChange={(details)=>{
                  const invoice = invoices.find((invoice) => invoice.invoiceNum.toString() === details.value[0])
                  if(invoice){
                     selectedInvoice[0]=invoice.invoiceNum.toString();
                     $form.paymentAmount=invoice.invoiceAmount;
                     $form.paymentNotes=`Payment for invoice number: ${invoice.invoiceNum}, ${invoice.invoiceNotes}`
                     $form.invoiceNum =invoice.invoiceNum;
                  }
                  invoiceSelected = true
               }}
            />
         {:else}
         {@const invoice = invoices.find((invoice) => invoice.invoiceNum === parseInt(selectedInvoice[0], 10))}
            {#if invoice}
               <InvoiceEmployee {invoice} />
            {/if}
         {/if}
      </div>
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