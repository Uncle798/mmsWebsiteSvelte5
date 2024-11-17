<script lang="ts">
   import EmailInput from '$lib/formComponents/EmailInput.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import type { EmailFormSchema } from '$lib/formSchemas/schemas';
	import { invalidateAll } from '$app/navigation';
	import FormProgress from '$lib/formComponents/FormSubmitWithProgress.svelte';
	import FormMessage from '$lib/formComponents/FormMessage.svelte';
    
    let { data, emailModalOpen=$bindable(false), emailVerificationModalOpen=$bindable(false) }: {
      data: SuperValidated<Infer<EmailFormSchema>>, 
      emailModalOpen:boolean,
      emailVerificationModalOpen:boolean
      } = $props();

   let { form, message, errors, constraints, enhance, delayed, timeout} = superForm(data, {
      onUpdate(){
         emailVerificationModalOpen=true;
         emailModalOpen=false;
      }, 
      
   })
</script>
<FormMessage message={$message}/>
<form action="/forms/emailUpdateForm" method="POST" use:enhance>
   <EmailInput
      bind:value={$form.email}
      errors={$errors.email}
      constraints={$constraints.email}
      label='Email'
      name='email'
   />
   <EmailInput
      bind:value={$form.emailConfirm}
      errors={$errors.emailConfirm}
      constraints={$constraints.emailConfirm}
      label='Confirm your email'
      name='emailConfirm'
   />
      <FormProgress delayed={$delayed} timeout={$timeout}/>
</form>