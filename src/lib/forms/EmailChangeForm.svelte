<script lang="ts">
   import EmailInput from '$lib/formComponents/EmailInput.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import type { EmailFormSchema } from '$lib/formSchemas/schemas';
	import FormProgress from '$lib/formComponents/FormSubmitWithProgress.svelte';
	import FormMessage from '$lib/formComponents/FormMessage.svelte';
   import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { User } from '@prisma/client';
   interface Props {
      data: SuperValidated<Infer<EmailFormSchema>>;
      emailModalOpen: boolean;
      user: User;
      classes?: string;
   }

   let { data, emailModalOpen=$bindable(false), user, classes }:Props = $props();
   const url = page.url.pathname;
   let { form, message, errors, constraints, enhance, delayed, timeout, capture, restore} = superForm(data, {
      onUpdated(){
         emailModalOpen=false;
      }, 
      onChange(event) {
         if(event.target){
            const formName = `${url}/emailChangeForm/userId=${user.id}:${event.path}`
            const value = event.get(event.path);
            if(value){
               sessionStorage.setItem(formName, value);
            }
         }
      },  
   })
   export const snapshot = {
      capture,
      restore,
   }
   onMount(() =>{
      for(const key in $form){
         let fullKey = `${url}/emailChangeForm:${key}`;
         const storedValue = sessionStorage.getItem(fullKey)
         if(storedValue){
            $form[key as keyof typeof $form] = storedValue;
         }
      }
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
         bind:value={$form.confirmEmail}
         errors={$errors.confirmEmail}
         constraints={$constraints.confirmEmail}
         label='Confirm your email'
         name='confirmEmail'
      />
      <input type="hidden" name="userId" id="userId" value={user.id}>
      <FormProgress delayed={$delayed} timeout={$timeout}/>
   </form>
</div>