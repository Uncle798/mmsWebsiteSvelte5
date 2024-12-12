<script lang="ts">
import type { SuperValidated, Infer } from "sveltekit-superforms";
import type { PartialUser } from "$lib/server/partialTypes";
import type { Lease } from "@prisma/client";
import type { NewPaymentRecordFormSchema} from "$lib/formSchemas/schemas";
import type { RegisterFormSchema } from "$lib/formSchemas/schemas";
import { superForm } from "sveltekit-superforms";
import { Combobox, Modal } from "@skeletonlabs/skeleton-svelte";
import RegisterForm from "./RegisterForm.svelte";
import FormMessage from "$lib/formComponents/FormMessage.svelte";
import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
import NumberInput from "$lib/formComponents/NumberInput.svelte";
import TextInput from "$lib/formComponents/TextInput.svelte";
import type { Invoice } from "@prisma/client";

interface Props {
      data: SuperValidated<Infer<NewPaymentRecordFormSchema>>;
      registerForm: SuperValidated<Infer<RegisterFormSchema>>;
      employeeId: string | undefined;
      customers: PartialUser[];
      invoices: Invoice[];
   }
   let { data, employeeId, customers, invoices, registerForm }:Props = $props();
   let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data, {
      onSubmit({formData}) {
         formData.set('customerId', selectedCustomer[0])
         formData.set('leaseId', selectedInvoice[0])
      },
   });
   let selectedCustomer = $state(['']);
   let selectedInvoice = $state([''])
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
   let registerFormOpen=$state(false);
   let currentInvoiceValue=$state(0);
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

<form action="/forms/newPaymentRecordForm" method="POST" use:enhance>
   <Combobox
   data={customerComboBoxData}
   bind:value={selectedCustomer}
   label='Select Customer'
   placeholder='Select...'
   openOnClick={true}
   />
   <button class="btn p-4" onclick={()=> registerFormOpen=true } type='button'>Create new customer</button>
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
            }
      }}
         />
   {/if}
      <NumberInput
         bind:value={$form.paymentAmount}
         errors={$errors.paymentAmount}
         constraints={$constraints.paymentAmount}
         label='Payment amount: $'
         name='paymentAmount'
      />
   <input type="hidden" name='employeeId' value={employeeId} />
   <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} />
</form>