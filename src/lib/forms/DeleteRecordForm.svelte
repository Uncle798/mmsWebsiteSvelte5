<script lang="ts">
	import { superForm } from "sveltekit-superforms";
   import type { DeleteRecordFormSchema } from "$lib/formSchemas/deleteRecordFormSchema";
	import type { Infer, SuperValidated } from "sveltekit-superforms";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import TextInput from "$lib/formComponents/TextInput.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";

   interface Props {
      data: SuperValidated<Infer<DeleteRecordFormSchema>>;
      recordNum: number;
      recordType: 'invoice' | 'payment' | 'refund';
      modalOpen?: boolean;
      classes?: string;
   }
   let { data, recordNum, recordType, modalOpen=$bindable(), classes }:Props = $props();
   let { form, errors, constraints, message, enhance, delayed, timeout} = superForm(data, {
      onUpdate(){
         modalOpen = false;
      },
   });
</script>

<div class={classes}>
   <FormMessage message={$message} />
   <form action="/forms/deleteRecordForm" method="POST" use:enhance>
      <TextInput
         value={$form.confirmRecordNum.toString()}
         constraints={$constraints.confirmRecordNum}
         errors={$errors.confirmRecordNum}
         name='confirmRecordNum'
         label='Please enter the record number to delete that record'
      />
      <input type="hidden" name="recordNum" id="recordNum" value={recordNum} />
      <input type="hidden" name="recordType" value={recordType} />
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} />
   </form>
</div>