<script lang="ts">
	import { superForm } from "sveltekit-superforms";
   import type { DeleteRecordFormSchema } from "$lib/formSchemas/deleteRecordFormSchema";
	import type { Infer, SuperValidated } from "sveltekit-superforms";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import TextInput from "$lib/formComponents/TextInput.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import { goto } from "$app/navigation";

   interface Props {
      data: SuperValidated<Infer<DeleteRecordFormSchema>>;
      recordNum: number;
      recordType: 'invoice' | 'payment' | 'refund';
      modalOpen?: boolean;
      classes?: string;
   }
   let { data, recordNum, recordType, modalOpen=$bindable(), classes }:Props = $props();
   // svelte-ignore state_referenced_locally
   let { form, errors, constraints, message, enhance, delayed, timeout} = superForm(data, {
      onUpdated(form){
         if(form.form.valid && !$message){
            modalOpen = false;
            switch (recordType) {
               case 'invoice':
                  goto('/invoices');
                  break;
               case 'payment':
                  goto('/paymentRecords');
                  break;
               case 'refund':
                  goto('/refundRecords');
                  break;
               default:
                  break;
            }
         }
      },
   });
</script>

<div class={classes}>
   <FormMessage message={$message} />
   <form action="/forms/deleteRecordForm" method="POST" use:enhance>
      <TextInput
         bind:value={$form.confirm}
         constraints={$constraints.confirm}
         errors={$errors.confirm}
         name='confirm'
         label='Please enter the record number to delete that record'
      />
      <input type="hidden" name="recordNum" id="recordNum" value={recordNum} />
      <input type="hidden" name="recordType" value={recordType} />
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} />
   </form>
</div>