<script lang="ts">
   import type { SuperValidated, Infer } from "sveltekit-superforms";
   import type { PartialUser } from "$lib/server/partialTypes";
   import type { Lease } from "@prisma/client";
   import type { NewInvoiceFormSchema, NewPaymentRecordFormSchema} from "$lib/formSchemas/schemas";
   import { superForm } from "sveltekit-superforms";
   import { Combobox, Modal, Switch } from "@skeletonlabs/skeleton-svelte";
   import FormMessage from "$lib/formComponents/FormMessage.svelte";
   import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
   import NumberInput from "$lib/formComponents/NumberInput.svelte";
   import TextInput from "$lib/formComponents/TextInput.svelte";
   import type { Invoice } from "@prisma/client";
	import NewInvoiceForm from "./NewInvoiceForm.svelte";
	import { onMount } from "svelte";

   interface Props {
      data: SuperValidated<Infer<NewPaymentRecordFormSchema>>;
      invoiceForm: SuperValidated<Infer<NewInvoiceFormSchema>>;
      employeeId: string | undefined;
      customers: PartialUser[];
      invoices: Invoice[];
      leases: Lease[];
      defaultCustomer?: string;
      defaultInvoice?: string;
   }
   let { data, employeeId, customers, invoices,  invoiceForm, leases, defaultCustomer='', defaultInvoice='' }:Props = $props();
   let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data, {
      onSubmit({formData}) {
         formData.set('customerId', selectedCustomer[0]);
         formData.set('invoiceNum', selectedInvoice[0]);
      },
   });
   let selectedCustomer = $state([defaultCustomer]);
   let selectedInvoice = $state([defaultInvoice])
   interface ComboBoxData {
      label: string;
      value: string;
   } 
   const customerComboBoxData:ComboBoxData[] = [];
   const invoiceComboBoxData:ComboBoxData[] = $derived.by(() =>{
      const customerInvoices = invoices.filter((invoice)=> invoice.customerId === selectedCustomer[0]);
      const data:ComboBoxData[]=[]
      customerInvoices.forEach((invoice) =>{
         const label = invoice.invoiceNotes ? invoice.invoiceNotes : invoice.invoiceNum.toString(10);
         const value = invoice.invoiceNum.toString(10);
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
   let invoiceFormOpen=$state(false);
   let invoiceSelected=$state(false);
   onMount(()=>{
      if(defaultInvoice){
         const invoice = invoices.find((invoice) => invoice.invoiceNum.toString() === defaultInvoice)
         if(invoice){
               invoiceSelected = true
               $form.paymentAmount=invoice.invoiceAmount;
               $form.paymentNotes=`Payment for invoice number: ${invoice.invoiceNum}`
               $form.deposit=invoice.deposit;
            }
      }
   })
</script>

<Modal
   bind:open={invoiceFormOpen}
   contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
   backdropClasses="backdrop-blur-sm"
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


<FormMessage message={$message} />

<form action="/forms/newPaymentRecordForm" method="POST" use:enhance>
   <div class="p-4">
      <Combobox
         data={customerComboBoxData}
         bind:value={selectedCustomer}
         label='Select Customer'
         placeholder='Select customer...'
         openOnClick={true}
      />
   </div>
   <div class="p-4">
      {#if !invoiceSelected}
         <button class="btn" onclick={()=>invoiceFormOpen=true} type='button'>Create New Invoice</button>
      {/if}
      {#if invoiceComboBoxData.length > 0 }
         <Combobox
            data={invoiceComboBoxData.sort()}
            bind:value={selectedInvoice}
            label="Select an invoice"
            placeholder="Select..."
            openOnClick={true}
            onValueChange={(details)=>{
               const invoice = invoices.find((invoice) => invoice.invoiceNum.toString() === details.value[0])
               if(invoice){
                  $form.paymentAmount=invoice.invoiceAmount;
                  $form.paymentNotes=`Payment for invoice number: ${invoice.invoiceNum}`
               }
               invoiceSelected = true
            }}
         />
      {/if}
   </div>
   {#if invoiceSelected}
      <NumberInput
         bind:value={$form.paymentAmount}
         errors={$errors.paymentAmount}
         constraints={$constraints.paymentAmount}
         label='Payment amount: $'
         name='paymentAmount'
      />
      <div class="p-4">
      <label for="paymentType">Payment type
         <select name="paymentType" id="paymentType" class="select">
            <option value='CASH'>Cash</option>
            <option value="CHECK">Check</option>
            <option value="STRIPE">Credit Card</option>
         </select>
      </label>
      </div>
      <input type="hidden" name='employeeId' value={employeeId} />
      <TextInput
         bind:value={$form.paymentNotes}
         errors={$errors.paymentNotes}
         constraints={$constraints.paymentNotes}
         label='Payment Notes'
         name='paymentNotes'
      />
      <div class="card p-4">
         <Switch bind:checked={$form.deposit} name='deposit'>
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