<script lang=ts>
   import FormMessage from "$lib/formComponents/FormMessage.svelte";
   import TextInput from "$lib/formComponents/TextInput.svelte";
   import EmailInput from "$lib/formComponents/EmailInput.svelte";
   import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
   import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
   import type { OnboardingRegisterFormSchema } from "$lib/formSchemas/onboardingRegisterFormSchema";
	import { onMount } from "svelte";
	import { page } from "$app/state";
   
   interface Props {
      data: SuperValidated<Infer<OnboardingRegisterFormSchema>>
      registerFormModalOpen?: boolean
      formType: 'customer' | 'employee'
      redirectTo?:string;
      classes?: string;
      emailVerificationModalOpen?: boolean
      unitNum?: string;
      userId?: string;
   }
   const url = page.url
   let { 
      data, registerFormModalOpen=$bindable(false), emailVerificationModalOpen=$bindable(false), formType, redirectTo, classes, unitNum, userId=$bindable('') }:Props = $props();
   // svelte-ignore state_referenced_locally
   let { form, errors, constraints, message, enhance, delayed, timeout, capture, restore, } = superForm(data, {
      onChange(event) {
         if(event.target){
            const key = `${url.pathname}/registerForm:${event.path}`
            const value = event.get(event.path);
            if(value){
               sessionStorage.setItem(key, value);
            }else {
               sessionStorage.removeItem(key);
            }
         }
      },
      onUpdate({form, result}){
         const data = result.data;
         if(form.valid && data.userId){
            userId = data.userId;
         }
      }, 
      onUpdated(){
         registerFormModalOpen=false;
         emailVerificationModalOpen=true;
         sessionStorage.clear();
      }
   });
   export const snapshot = {
      capture, 
      restore, 
   }
   onMount(() =>{
      for(const key in $form){
         let fullKey = `${url.pathname}/registerForm:${key}`;
         const storedValue = sessionStorage.getItem(fullKey)
         if(storedValue){
            $form[key as keyof typeof $form] = storedValue;
         }
      }
   })
</script>
<div class={classes}>
   <FormMessage message={$message} />
   <form method="POST" action="/forms/registerForm?/employee&redirectTo={redirectTo}&unitNum={unitNum}" use:enhance>
      <TextInput
         label='Given name'
         name='givenName'
         bind:value={$form.givenName}
         errors={$errors.givenName}
         constraints={$constraints.givenName}
         placeholder='Smokey'
      />
      <TextInput
         label='Family name'
         name='familyName'
         bind:value={$form.familyName}
         errors={$errors.familyName}
         constraints={$constraints.familyName}
         placeholder='Bear'
      />
      <TextInput
         bind:value={$form.organizationName}
         errors={$errors.organizationName}
         constraints={$constraints.organizationName}
         label='Organization name (optional)'
         name='organizationName'
         placeholder='The Forrest'
      />
      <EmailInput
         label="Email"
         name="email"
         bind:value={$form.email}
         errors={$errors.email}
         constraints={$constraints.email}
         placeholder='smokeybear@theforest.email'
      />
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} classes='my-2'/>
   </form>
</div>