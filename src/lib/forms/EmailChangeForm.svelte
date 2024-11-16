<script lang="ts">
   import EmailInput from '$lib/formComponents/EmailInput.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
   import { Progress, ProgressRing } from '@skeletonlabs/skeleton-svelte';
	import type { EmailFormSchema } from '$lib/formSchemas/schemas';
	import { invalidateAll } from '$app/navigation';
	import FormProgress from '$lib/formComponents/FormProgress.svelte';
	import FormMessage from '$lib/formComponents/FormMessage.svelte';
    
    let { data, emailModalOpen=$bindable(false), emailVerificationOpen=$bindable(false) }: {
      data: SuperValidated<Infer<EmailFormSchema>>, 
      emailModalOpen:boolean,
      emailVerificationOpen:boolean
      } = $props();

   let { form, message, errors, constraints, enhance, delayed, timeout} = superForm(data, {
      onUpdate(){
         emailVerificationOpen=true;
         emailModalOpen=false;
         invalidateAll();
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
   <button class="btn">Submit</button>
   <FormProgress delayed={$delayed} timeout={$timeout}/>
</form>