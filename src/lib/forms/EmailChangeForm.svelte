<script lang="ts">
   import EmailInput from '$lib/formComponents/EmailInput.svelte';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import type { EmailFormSchema } from '$lib/formSchemas/schemas';
	import { invalidateAll } from '$app/navigation';
	import FormProgress from '$lib/formComponents/FormSubmitWithProgress.svelte';
	import FormMessage from '$lib/formComponents/FormMessage.svelte';
   interface Props {
      data: SuperValidated<Infer<EmailFormSchema>>;
      emailModalOpen: boolean;
      emailVerification: boolean;
      classes?: string;
   }

    let { data, emailModalOpen=$bindable(false), emailVerification=$bindable(false), classes }:Props = $props();

   let { form, message, errors, constraints, enhance, delayed, timeout} = superForm(data, {
      onUpdated(){
         emailVerification=true;
         emailModalOpen=false;
      },   
   })
</script>
<div class={classes}>
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
</div>