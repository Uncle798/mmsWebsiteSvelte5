<script lang='ts'>
	import { goto } from "$app/navigation";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import type { ExpenseDeleteFormSchema } from "$lib/formSchemas/expenseDeleteFormSchema";
	import type { Infer, SuperValidated } from "sveltekit-superforms";
   import { superForm } from "sveltekit-superforms";
	import type { Expense } from "../../generated/prisma/browser";
	import TextInput from "$lib/formComponents/TextInput.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";

   interface Props {
      data: SuperValidated<Infer<ExpenseDeleteFormSchema>>;
      expense: Expense;
      modalOpen?: boolean;
      classes?: string;
   }
   let { data, expense, modalOpen=$bindable(), classes }:Props = $props();
   // svelte-ignore state_referenced_locally
   let { form, errors, constraints, message, enhance,  delayed, timeout } = superForm(data, {
      onUpdated({form}) {
         if(form.valid && !$message){
            modalOpen = false;
         }else if(form.valid && $message === 'Expense deleted'){
            setTimeout(() => {
               modalOpen = false;
               goto('/expenses')
            }, 1000);
         }
       },
   });
</script>
<div class="{classes}">
   <FormMessage message={$message} />
   <form action="/forms/expenseDeleteForm" method="POST" use:enhance>
      <TextInput
         value={$form.confirmAmount}
         errors={$errors.confirmAmount}
         constraints={$constraints.confirmAmount}
         label='Enter amount of expense to delete it'
         name='confirmAmount'
      />
      <input type="hidden" name="expenseId" id="expenseId" value={expense.id} />
      <input type="hidden" name="amount" id="amount" value={expense.amount} />
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText='Delete expense'/>
   </form>
</div>