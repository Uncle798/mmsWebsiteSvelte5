<script lang='ts'>
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import TextInput from "$lib/formComponents/TextInput.svelte";
   import type { LeaseDiscountFormSchema } from "$lib/formSchemas/schemas";
	import type { Infer, SuperValidated } from "sveltekit-superforms";
   import { superForm } from "sveltekit-superforms";

   interface Props {
      data: SuperValidated<Infer<LeaseDiscountFormSchema>>,
      unitNum: string | undefined,
      customerId?: string, 
   }
   let { data, unitNum, customerId }:Props = $props();
   let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data, {
      onUpdate(){
      }
   });
</script>

<FormMessage message={$message} />
<form action='/forms/leaseDiscountForm?userId={customerId}' method="post" use:enhance>
   <div class="card m-4">
      <TextInput
      bind:value={$form.code}
      errors={$errors.code}
      constraints={$constraints.code}
      label="Discount Code:"
      name='code'
      placeholder='optional'
      />
      <input type="hidden" name="unitNum" value={unitNum} />
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText="Apply discount"/>
   </div>
</form>