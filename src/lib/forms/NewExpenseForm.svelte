<script lang='ts'>
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import NumberInput from "$lib/formComponents/NumberInput.svelte";
	import TextArea from "$lib/formComponents/TextArea.svelte";
	import type { NewExpenseFormSchema } from "$lib/formSchemas/newExpenseFormSchema";
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
         if(!$message && !$errors){
            modalOpen = false;
         }
      }
   });
</script>
<div class="{classes}">
   <FormMessage message={$message} />
   <form action="/forms/newExpenseForm" method="POST" use:enhance>
      <TextArea
         value={$form.explanation}
         errors={$errors.explanation}
         constraints={$constraints.explanation}
         name='explanation'
         label='Explanation'
      />
      <NumberInput
         value={$form.amount}
         errors={$errors.amount}
         constraints={$constraints.amount}
         name='amount'
         label='Amount'
      />
      <input type="hidden" name='vendorId' id='vendorId' value={vendorId} />
      <input type="hidden" name="employeeId" id="employeeId" value={employeeId} />
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} />
   </form>
</div>