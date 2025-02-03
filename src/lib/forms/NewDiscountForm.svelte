<script lang="ts">
	import type { NewDiscountFormSchema } from "$lib/formSchemas/schemas";
	import type { Infer, SuperValidated } from "sveltekit-superforms";
   import { superForm } from "sveltekit-superforms";
   import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import TextInput from "$lib/formComponents/TextInput.svelte";
	import NumberInput from "$lib/formComponents/NumberInput.svelte";
   import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
   interface Props {
      data: SuperValidated<Infer<NewDiscountFormSchema>>;
      classes?: string;
   }
   let { data, classes }:Props = $props();
   let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data, {

   });
</script>
<div class={classes}>
   <FormMessage message={$message} />
   <form action='/forms/newDiscountForm' method="POST" use:enhance >
      <TextInput
         bind:value={$form.code}
         errors={$errors.code}
         constraints={$constraints.code}
         label='Code (Case Sensitive, must be at least 8 characters)'
         name='code'
         placeholder='NonProfit10'
      />
      <NumberInput
         bind:value={$form.amountOff}
         errors={$errors.amountOff}
         constraints={$constraints.amountOff}
         label='Discount amount (dollars off) $'
         name='amountOff'
      />
      <TextInput
         bind:value={$form.notes}
         errors={$errors.notes}
         constraints={$constraints.notes}
         label='Notes'
         name='notes'
         placeholder='For any non-profits'
      />
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} />
   </form>
</div>