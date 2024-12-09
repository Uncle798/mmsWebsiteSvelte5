<script lang="ts">
   import { superForm } from "sveltekit-superforms";  
	import type { PageData } from "./$types";
	import EmailInput from "$lib/formComponents/EmailInput.svelte";
   import TextInput from "$lib/formComponents/TextInput.svelte";
   import FormProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import Header from "$lib/Header.svelte";
	import { blur } from "svelte/transition";
   interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const { form, errors, constraints, message, enhance, delayed, timeout } = superForm(data.registerForm)

</script>
<Header title='Register a new account' />
<div transition:blur={{duration:600}}>
   <FormMessage message={$message} />
   <form method="POST" action="/register" use:enhance>
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
      <EmailInput
        label="Confirm email"
        name="emailConfirm"
        bind:value={$form.emailConfirm}
        errors={$errors.emailConfirm}
        constraints={$constraints.emailConfirm}
        placeholder='smokeybear@theforest.email'
      />
     
      <FormProgress delayed={$delayed} timeout={$timeout}/>
   </form>
</div>
<a href="/login/magicLink?redirectTo={data.redirectTo}&unitNum={data.unitNum}">Already have an account? Login here.</a>