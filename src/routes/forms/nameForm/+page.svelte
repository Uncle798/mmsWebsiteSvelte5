<script lang="ts">
   import TextInput from '$lib/formComponents/textInput.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import type { NameFormSchema } from '$lib/formSchemas/schemas';
    
   let { data }:{data: SuperValidated<Infer<NameFormSchema>>} = $props();
   let { form, errors, message, constraints, enhance} = superForm(data);
</script>

<h2 class="h2">Update your name</h2>
{#if $message}
   {$message}
{/if}

<form action="/forms/nameForm" method="POST" use:enhance>
   <TextInput
   bind:value={$form.givenName}
   errors={$errors.givenName}
   constraints={$constraints.givenName}
   label='Given Name'
   name='givenName'
   placeholder='Smokey'
   />
   
   <TextInput
   bind:value={$form.familyName}
   errors={$errors.familyName}
   constraints={$constraints.familyName}
   label='Family Name'
   name='familyName'
   placeholder='Bear'
   />
   <button class="btn">Submit</button>
</form>