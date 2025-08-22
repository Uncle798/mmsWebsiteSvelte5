<script lang="ts">
   import EmailInput from '$lib/formComponents/EmailInput.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import type { EmailFormSchema } from '$lib/formSchemas/schemas';
	import FormProgress from '$lib/formComponents/FormSubmitWithProgress.svelte';
	import FormMessage from '$lib/formComponents/FormMessage.svelte';
   import { onMount } from 'svelte';
   interface Props {
      data: SuperValidated<Infer<EmailFormSchema>>;
      emailModalOpen: boolean;
      classes?: string;
   }

    let { data, emailModalOpen=$bindable(false), classes }:Props = $props();

   let { form, message, errors, constraints, enhance, delayed, timeout, capture, restore} = superForm(data, {
      onUpdated(){
         emailModalOpen=false;
      }, 
      onChange(event) {
         if(event.target){
            const formName = 'emailChangeForm'
            const value = event.get(event.path);
            if(value){
               sessionStorage.setItem(`${formName}:${event.path}`, value);
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
         let fullKey = `emailChangeForm:${key}`;
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
      <FormProgress delayed={$delayed} timeout={$timeout}/>
   </form>
</div>