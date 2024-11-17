<script lang="ts">
   import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";  
   import TextInput from '$lib/formComponents/textInput.svelte';
   import type { EmailVerificationFormSchema } from "$lib/formSchemas/schemas";
   import FormProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
   import { invalidateAll } from "$app/navigation";
   import FormMessage from "$lib/formComponents/FormMessage.svelte";
   
   let {
      data, 
      emailVerificationModalOpen=$bindable(false),
      redirect=$bindable('')
   }:{
      data:SuperValidated<Infer<EmailVerificationFormSchema>>, 
      emailVerificationModalOpen:boolean,
      redirect:string
   } = $props();
   let { form, errors, constraints, message, enhance, submitting, delayed, timeout } = superForm(data, {
       onUpdate(event) {
         console.log(event);
       },
   });
</script>
<FormMessage message={$message} />
<form method="POST" action="/register/emailVerification?/verify" use:enhance>
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
   <button class="btn">Resend email</button>
</form>