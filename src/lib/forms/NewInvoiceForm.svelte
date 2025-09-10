<script lang="ts">
	import type { EmailVerificationFormSchema, NewInvoiceFormSchema, RegisterFormSchema } from "$lib/formSchemas/schemas";
	import type { Lease, User } from "@prisma/client";
	import { Combobox, Modal, Tooltip, Switch } from "@skeletonlabs/skeleton-svelte";
	import { onMount } from "svelte";
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
	import EmailVerificationForm from "./EmailVerificationForm.svelte";
	import RegisterForm from "./RegisterForm.svelte";
	import Header from "$lib/Header.svelte";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
   import NumberInput from "$lib/formComponents/NumberInput.svelte";
   import DateInput from "$lib/formComponents/DateInput.svelte";
   import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import { goto } from "$app/navigation";
	import { Info } from "lucide-svelte";
	import dayjs from "dayjs";
   
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
   let { form, errors, message, constraints, enhance, delayed, timeout, } = superForm(data, {
      onChange(event) {
         if(event.target){
            const formName = 'newInvoiceForm'
            const value = event.get(event.path);
            if(value){
               sessionStorage.setItem(`${formName}:${event.path}`, value.toString());
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
   let invoiceNotesTooltipOpen = $state(false);
   let registerFormModalOpen = $state(false);
   onMount(()=>{
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
         $form.invoiceNotes=`Rent for unit ${lease.unitNum.replace(/^0+/gm, '')} for ${dayjs().format('MMMM YYYY')}`;
         $form.invoiceAmount=lease.price;
         $form.invoiceDue=new Date()
      }
      if(customer){
         $form.customerId=customer.id
      }
   })
</script>
<Modal
   open={registerFormModalOpen}
   onOpenChange={(e)=>registerFormModalOpen=e.open}
   contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-(--breakpoint-sm)"
   backdropClasses="backdrop-blur-xs"
>
   {#snippet content()}
      {#if customer}
         <EmailVerificationForm data={emailVerificationFormData} userId={customer.id} redirect='false' bind:emailVerificationModalOpen={registerFormModalOpen} />
      {:else}
         <RegisterForm data={registerFormData} bind:registerFormModalOpen={registerFormModalOpen} formType='employee' redirectTo='invoices/new' />
      {/if}
         <button class="btn preset-filled-primary-50-950 rounded-lg h-fit" onclick={()=>registerFormModalOpen=false}>Cancel</button>
   {/snippet}
</Modal>
<Header title='New Invoice' />
<FormMessage message={$message} />
<div class={classes}>
   {#if !customer}
      <button class="btn preset-filled-primary-50-950 my-2" onclick={() => registerFormModalOpen = true}>Create new customer</button>
      or, 
      <Combobox
         data={customersComboboxData}
         label='Select Customer'
         placeholder='Type or select...'
         openOnClick={true}
         optionClasses='truncate'
         onValueChange={(details) => {
            goto(`/invoices/new?userId=${details.value}`);
         }}
      />
   {/if}
   {#if leases}
      {#if customer}         
         <Combobox
            data={leasesComboboxData}
            label='Select unit'
            placeholder='Type or select'
            openOnClick={true}
            onValueChange={(details) => {
               goto(`/invoices/new?leaseId=${details.value}&userId=${customer.id}`)
            }}
         />
      {:else}
         <Combobox
            data={leasesComboboxData}
            label='Select unit'
            placeholder='Type or select'
            openOnClick={true}
            onValueChange={(details) => {
               goto(`/invoices/new?leaseId=${details.value}`)
            }}
         />
      {/if}
   {/if}
   {#if customer || lease}
      
      <form action="/forms/newInvoiceForm" class='mx-2' method="POST" use:enhance>
         <div class="">
            <label class="label ">
               <span class="label-text">Invoice notes
                  <Tooltip
                     open={invoiceNotesTooltipOpen}
                     onOpenChange={(e) => invoiceNotesTooltipOpen = e.open}
                     positioning={{placement: 'top-end'}}
                     contentBase="card preset-filled p-2 wrap-word max-w-4xl"
                     openDelay={200}
                     closeDelay={200}
                     zIndex='30'
                     arrow={true}
                     closeOnScroll={true}
                  >
                     {#snippet trigger()}
                        <Info aria-label='Invoice Notes tooltip' size={15} />
                     {/snippet}
                     {#snippet content()}
                        Invoice notes are the place to store information for you and your customer. MMS has defaults but those can be edited, and we can change the defaults.
                     {/snippet}
                  </Tooltip>
                  </span>
               <textarea
                  class="input rounded-none h-auto"
                  rows=3
                  name="invoiceNotes"
                  {...$constraints.invoiceNotes}
               >{$form.invoiceNotes}</textarea>
               <!-- Above formatting required for proper display of notes in text area -->
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
         <input type="hidden" name="customerId" value={customer?.id} />
         <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText='Create Invoice'/>
      </form>
   {/if}
</div>