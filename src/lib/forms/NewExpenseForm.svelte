<script lang='ts'>
	import { goto } from "$app/navigation";
	import DatePickerSingle from "$lib/formComponents/DatePickerSingle.svelte";
   import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import TextArea from "$lib/formComponents/TextArea.svelte";
	import TextInput from "$lib/formComponents/TextInput.svelte";
	import type { NewExpenseFormSchema } from "$lib/formSchemas/newExpenseFormSchema";
	import { FileUpload } from "@skeletonlabs/skeleton-svelte";
	import { FileIcon } from "lucide-svelte";
	import type { Infer, SuperValidated } from "sveltekit-superforms";
   import { superForm } from "sveltekit-superforms";

   interface Props {
      data: SuperValidated<Infer<NewExpenseFormSchema>>;
      employeeId: string;
      vendorId: string;
      modalOpen?: boolean;
      classes?: string;
   }
   let { data, employeeId, vendorId, modalOpen=$bindable(), classes }:Props = $props()
     // svelte-ignore state_referenced_locally
   let { form, errors, message, constraints, enhance, delayed, timeout, } = superForm(data, {
      onUpdated() {
         if(!$message && $message === 'Expense created'){
            modalOpen = false;
            setTimeout(() => {
               goto('/expenses/new')
            }, 1000);
         }
      }
   });
</script>
<div class="{classes}">
   <FormMessage message={$message} />
   <form action="/forms/newExpenseForm" method="POST" use:enhance enctype="multipart/form-data">
      <TextArea
         value={$form.explanation}
         errors={$errors.explanation}
         constraints={$constraints.explanation}
         name='explanation'
         label='Explanation'
      />
      <TextInput
         value={$form.amount}
         errors={$errors.amount}
         constraints={$constraints.amount}
         name='amount'
         label='Amount'
      />
      <DatePickerSingle
         value={$form.datePurchased}
         errors={$errors.datePurchased}
         constraints={$constraints.datePurchased}
         name='datePurchased'
         label='Date purchased'
      />
      <FileUpload name='receipt' accept={['application/pdf', 'image/jpeg', 'image/png']}>
         <FileUpload.Label>Receipt</FileUpload.Label>
         <FileUpload.Dropzone>
            <FileIcon class='size-10' />
            <div>Select file or drag it here</div>
            <FileUpload.Trigger>Browse files</FileUpload.Trigger>
            <FileUpload.HiddenInput />
         </FileUpload.Dropzone>
         <FileUpload.ItemGroup>
            <FileUpload.Context>
               {#snippet children(fileUpload)}
                  {#each fileUpload().acceptedFiles as file (file.name)}
                     <FileUpload.Item {file} >
                        <FileUpload.ItemName>{file.name}</FileUpload.ItemName>
                        <FileUpload.ItemSizeText>{file.size / 1000} kb</FileUpload.ItemSizeText>
                        <FileUpload.ItemDeleteTrigger />
                     </FileUpload.Item>
                  {/each}
               {/snippet}
            </FileUpload.Context>
         </FileUpload.ItemGroup>
         <FileUpload.ClearTrigger>Clear files</FileUpload.ClearTrigger>
      </FileUpload>
      <input type="hidden" name='vendorId' id='vendorId' value={vendorId} />
      <input type="hidden" name="employeeId" id="employeeId" value={employeeId} />
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} />
   </form>
</div>