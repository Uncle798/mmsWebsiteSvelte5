<script lang="ts">
   import EmailInput from '$lib/formComponents/EmailInput.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
   import { Progress, ProgressRing } from '@skeletonlabs/skeleton-svelte';
	import type { EmailFormSchema } from '$lib/formSchemas/schemas';
    
    let { data, emailModalOpen=$bindable(false), emailVerificationOpen=$bindable(false) }: {
      data: SuperValidated<Infer<EmailFormSchema>>, 
      emailModalOpen:boolean,
      emailVerificationOpen:boolean
      } = $props();

   let { form, message, errors, constraints, enhance, delayed, timeout} = superForm(data, {
      onUpdate(){
         emailVerificationOpen=true;
         emailModalOpen=false;
      }
   })
</script>
{#if $message}
   <span>{$message}</span>
{/if}
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
   {#if $delayed && !$timeout}
      <ProgressRing value={null} size="size-14" meterStroke="stroke-tertiary-600-400" trackStroke="stroke-tertiary-50-950" />
   {/if}
   {#if $timeout}
      <Progress value={null} />
   {/if}
</form>