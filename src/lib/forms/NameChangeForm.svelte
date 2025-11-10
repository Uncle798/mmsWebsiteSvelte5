<script lang="ts">
   import TextInput from '$lib/formComponents/TextInput.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
   import FormProgress from '$lib/formComponents/FormSubmitWithProgress.svelte';
	import type { NameFormSchema } from '$lib/formSchemas/nameFormSchema';
	import FormMessage from '$lib/formComponents/FormMessage.svelte';
	import { onMount } from 'svelte';
   
   interface Props {
      data: SuperValidated<Infer<NameFormSchema>>;
      nameModalOpen: boolean;
      classes?: string;
   }

   let { data, nameModalOpen=$bindable(false), classes }:Props = $props();
   let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data, {
      onChange(event) {
         if(event.target){
            const formName = 'nameChangeForm';
            const value = event.get(event.path);
            if(value){
               sessionStorage.setItem(`${formName}:${event.path}`, value);
            }
         }
      },
      onUpdate(){
         nameModalOpen=false;

      }
   });
   onMount(() => {
      for(const key in $form){
         let fullKey = `nameChangeForm:${key}`;
         const storedValue = sessionStorage.getItem(fullKey)
         if(storedValue){
            $form[key as keyof typeof $form] = storedValue;
         }
      }
   })
</script>
<div class={classes}>
   <FormMessage message={$message} />
   <form action="/forms/nameForm" method="POST" use:enhance>
      <TextInput
         bind:value={$form.givenName}
         errors={$errors.givenName}
         constraints={$constraints.givenName}
         label='Given Name'
         name='givenName'
         placeholder='Smokey'
         autocomplete='given-name'
      />
      
      <TextInput
         bind:value={$form.familyName}
         errors={$errors.familyName}
         constraints={$constraints.familyName}
         label='Family Name'
         name='familyName'
         placeholder='Bear'
         autocomplete='family-name'
      />
      <TextInput
         bind:value={$form.organizationName}
         errors={$errors.organizationName}
         constraints={$constraints.organizationName}
         label='Organization name (optional)'
         name='organizationName'
         placeholder='The Forrest'
         autocomplete='organization'
      />
      <FormProgress delayed={$delayed} timeout={$timeout}/>
   </form>
</div>