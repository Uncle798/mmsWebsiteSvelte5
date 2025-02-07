<script lang="ts">
   import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";  
   import TextInput from '$lib/formComponents/TextInput.svelte';
   import type { EmailVerificationFormSchema } from "$lib/formSchemas/schemas";
   import FormProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
   import { invalidateAll } from "$app/navigation";
   import FormMessage from "$lib/formComponents/FormMessage.svelte";
   
   interface Props {
      data: SuperValidated<Infer<EmailVerificationFormSchema>>; 
      emailVerificationModalOpen: boolean;
      redirect: string;
      emailVerification: Boolean;
      classes?: string;
   }
   let {
      data, 
      emailVerificationModalOpen=$bindable(),
      redirect=$bindable(''),
      emailVerification=$bindable(),
      classes,
   }:Props = $props();
   let { form, errors, constraints, message, enhance, submitting, delayed, timeout } = superForm(data, {
      onSubmit(){
         emailVerification=false;
      }, 
      onUpdated(event) {
         emailVerificationModalOpen = false;
         emailVerification = false;
       },
   });
</script>
<div class={classes}>
   <FormMessage message={$message} />
   <form method="POST" action="/register/emailVerification?/verify&redirect={redirect}" use:enhance>
      <TextInput
         label="Code: "
         name="code"
         bind:value={$form.code}
         errors={$errors.code}
         constraints={$constraints.code}
         placeholder='12345678'
      />
      <FormProgress delayed={$delayed} timeout={$timeout}/>
   </form>

   <form method="POST" action="/register/emailVerification?/resend" >
      <button class="btn bg-preset-950">Resend email</button>
   </form>
</div>