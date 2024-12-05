<script lang="ts">
   import { superForm } from "sveltekit-superforms";  
	import type { PageData } from "./$types";
   import { zxcvbn, zxcvbnOptions, type Score } from "@zxcvbn-ts/core";
	import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
	import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";
	import EmailInput from "$lib/formComponents/EmailInput.svelte";
   import TextInput from "$lib/formComponents/TextInput.svelte";
	import PasswordInput from "$lib/formComponents/PasswordInput.svelte";
   import FormProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
   interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	// let passwordTouched = $state(false);
	// const { translations } = zxcvbnEnPackage;
	// const { adjacencyGraphs: graphs, dictionary: commonDictionary } = zxcvbnCommonPackage;
	// const { dictionary: englishDictionary } = zxcvbnEnPackage;
	// const options = {
	// 	translations,
	// 	graphs,
	// 	dictionary: { ...commonDictionary, ...englishDictionary },
	// };
	// zxcvbnOptions.setOptions(options);
	const { form, errors, constraints, message, enhance, delayed, timeout } = superForm(data.registerForm)
	// let {
	// score,
	// feedback: { warning, suggestions },
	// } = $derived(zxcvbn($form.password));
	// let strengthDescription = $state("Low");
	// $effect.pre(() => {
	// 	switch (score) {
	// 	case 3:
	// 		strengthDescription = "OK";
	// 		break;
	// 	case 4:
	// 		strengthDescription = "Good";
	// 		break;
	// 	case 0:
	// 	case 1:
	// 	case 2:
	// 	default:
	// 		strengthDescription = "Low";
	// 	}
	// });
</script>

<div>
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
      <!-- <PasswordInput
         label="Password"
         name="password"
         bind:value={$form.password}
         errors={$errors.password}
         constraints={$constraints.password}
         placeholder='Password234'
         onclick={()=> passwordTouched=true}
      />
      <PasswordInput
         label="Confirm Password"
         name="passwordConfirm"
         bind:value={$form.passwordConfirm}
         errors={$errors.passwordConfirm}
         constraints={$constraints.passwordConfirm}
         placeholder='Password234'
      /> -->

      <!-- {#if passwordTouched}
      <label for="password-strength">Password strength: {strengthDescription}</label>
      <meter id="password-strength" value={score} low="1.9" high="2.9" optimum="4" max="4"></meter>
      {#if warning}
         <span class="warning"> {warning}</span>
         <ul>
            {#each suggestions as suggestion}
               <li class="alert">{suggestion}</li>
            {/each}
         </ul>
         {/if}
     {/if}  -->
      <FormProgress delayed={$delayed} timeout={$timeout}/>
   </form>
</div>
<a href="/login/magicLink?redirectTo={data.redirectTo}&unitNum={data.unitNum}">Already have an account? Login here.</a>