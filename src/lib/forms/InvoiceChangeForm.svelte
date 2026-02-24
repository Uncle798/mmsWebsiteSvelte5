<script lang='ts'>
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
   import type { InvoiceChangeFormSchema } from "$lib/formSchemas/invoiceChangeFormSchema";
	import type { Infer, SuperValidated } from "sveltekit-superforms";
   import { superForm } from "sveltekit-superforms";
	import type { Invoice } from "../../generated/prisma/browser";
	import TextArea from "$lib/formComponents/TextArea.svelte";
	import { onMount } from "svelte";
	import NumberInput from "$lib/formComponents/NumberInput.svelte";
	import DatePickerSingle from "$lib/formComponents/DatePickerSingle.svelte";

   interface Props {
      data: SuperValidated<Infer<InvoiceChangeFormSchema>>;
      invoice: Invoice;
      modalOpen?: boolean;
      classes?: string;
   }
   let { data, invoice, modalOpen=$bindable(), classes }:Props = $props();
   // svelte-ignore state_referenced_locally
   let { form, errors, constraints, message, enhance,  delayed, timeout } = superForm(data, {
      onUpdated({form}) {
         if(form.valid && !$message){
            modalOpen = false;
         }else if(form.valid && $message === 'Invoice updated'){
            setTimeout(() => {
               modalOpen = false;
            }, 1000);
         }
       },
   });
   onMount(() => {
      $form.invoiceNotes = invoice.invoiceNotes ? invoice.invoiceNotes : undefined;
      $form.amountPaid = invoice.amountPaid;
      $form.invoiceAmount = invoice.invoiceAmount;
   })
</script>
<div class={classes}>
   <FormMessage message={$message} />
   <form action="/forms/invoiceChangeForm" method="POST" use:enhance>
      <NumberInput
         bind:value={$form.invoiceAmount}
         errors={$errors.invoiceAmount}
         constraints={$constraints.invoiceAmount}
         label='Invoice amount'
         name='invoiceAmount'
      />
      <NumberInput
         bind:value={$form.amountPaid}
         errors={$errors.amountPaid}
         constraints={$constraints.amountPaid}
         label='Amount paid'
         name='amountPaid'
      />
      <DatePickerSingle
         bind:value={$form.invoiceDue}
         errors={$errors.invoiceDue}
         constraints={$constraints.invoiceDue}
         label='Invoice due date'
         name='invoiceDues'
      />
      <TextArea
         bind:value={$form.invoiceNotes}
         label='Invoice notes'
         name='invoiceNotes'
         errors={$errors.invoiceNotes}
         constraints={$constraints.invoiceNotes}
      />
      <input type="hidden" name="invoiceNum" id="invoiceNum" value={invoice.invoiceNum} />
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} classes='mt-2' />
   </form>
</div>