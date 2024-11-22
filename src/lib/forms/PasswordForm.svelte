<script lang='ts'>
   import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
   import type { PasswordFormSchema } from "$lib/formSchemas/schemas";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import PasswordInput from "$lib/formComponents/PasswordInput.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
   interface Props{
      data: SuperValidated<Infer<PasswordFormSchema>>;
      passwordModalOpen: boolean
   }

   let {data, passwordModalOpen=$bindable(false)}:Props = $props()
   let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data, {
      onUpdate(){
         passwordModalOpen=false
      }
   });
</script>

<FormMessage message={$message} />
<form action="/forms/passwordChange" method="POST" use:enhance>
   <PasswordInput
      bind:value={$form.password}
      errors={$errors.password}
      constraints={$constraints.password}
      label="Enter a new password"
      name="password"
      placeholder="P@ssw0rd"
   />
   <PasswordInput
      bind:value={$form.passwordConfirm}
      errors={$errors.passwordConfirm}
      constraints={$constraints.passwordConfirm}
      label="Confirm your password"
      name="passwordConfirm"
      placeholder="P@ssw0rd"
   />
   <FormSubmitWithProgress delayed={$delayed} timeout={$timeout}/>
</form>