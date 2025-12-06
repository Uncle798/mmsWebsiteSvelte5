<script lang='ts'>
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
   import type { InvoiceChangeFormSchema } from "$lib/formSchemas/invoiceChangeFormSchema";
	import type { Infer, SuperValidated } from "sveltekit-superforms";
   import { superForm } from "sveltekit-superforms";
	import type { Invoice } from "../../generated/prisma/browser";
	import TextArea from "$lib/formComponents/TextArea.svelte";
	import { onMount } from "svelte";

   interface Props {
      data: SuperValidated<Infer<InvoiceChangeFormSchema>>;
      invoice: Invoice;
      modalOpen?: boolean;
      classes?: string;
   }
   let { data, invoice, modalOpen, classes }:Props = $props();
      let { form, errors, constraints, message, enhance,  delayed, timeout } = superForm(data, {
      onSubmit(){
      }, 
      onUpdated() {
         modalOpen = false;
       },
   });
   onMount(() => {
      $form.invoiceNotes = invoice.invoiceNotes ? invoice.invoiceNotes : undefined;
   })
</script>
<div class={classes}>
   <FormMessage message={$message} />
   <form action="/forms/invoiceChangeForm" method="POST" use:enhance>
      <TextArea
         bind:value={$form.invoiceNotes}
         label='Invoice notes'
         name='invoiceNotes'
         errors={$errors.invoiceNotes}
         constraints={$constraints.invoiceNotes}
      />
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} />
   </form>
</div>