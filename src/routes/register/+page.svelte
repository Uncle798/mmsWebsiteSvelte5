<script lang="ts">
   import { superForm } from "sveltekit-superforms";  
   import TextInput from "$lib/formComponents/textInput.svelte";
	import type { PageData } from "./$types";
	import EmailInput from "$lib/formComponents/EmailInput.svelte";
	import PasswordInput from "$lib/formComponents/PasswordInput.svelte";
   export let data:PageData;
   const { form, errors, constraints, enhance, } = superForm(data.registerForm, {
      onUpdate(event) {
         console.log($form)
      },
   })
</script>

<div>
   <form method="post" use:enhance>
      <TextInput
         label='Given name'
         bind:value={$form.givenName}
         errors={$errors.givenName}
         constraints={$constraints.givenName}
         placeholder='Smokey'
      />
      <TextInput
         label='Family name'
         bind:value={$form.familyName}
         errors={$errors.familyName}
         constraints={$constraints.familyName}
         placeholder='Bear'
      />
      <EmailInput
        label="Email"
        bind:value={$form.email}
        errors={$errors.email}
        constraints={$constraints.email}
        placeholder='smokeybear@theforest.email'
      />
      <PasswordInput
         label="Password"
         bind:value={$form.password}
         errors={$errors.password}
         constraints={$constraints.password}
         placeholder='Password234'
      />
      <PasswordInput
         label="Confirm Password"
         bind:value={$form.passwordConfirm}
         errors={$errors.passwordConfirm}
         constraints={$constraints.passwordConfirm}
         placeholder='Password234'
      />
      <button class="btn">Submit</button>
   </form>
</div>
