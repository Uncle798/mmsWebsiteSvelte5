<script lang="ts">
    import EmailInput from '$lib/formComponents/EmailInput.svelte';
	import { superForm } from 'sveltekit-superforms';
import type { PageData } from './$types';
	import PasswordInput from '$lib/formComponents/PasswordInput.svelte';
    
    export let data: PageData;
    let { form, message, errors, constraints, enhance } = superForm(data.loginForm);
</script>
{#if $message}
    {$message}
{/if}
<form action="/login" method="POST" use:enhance>
    <EmailInput
        label='Email'
        name='email'
        bind:value={$form.email}
        errors={$errors.email}
        constraints={$constraints.email}
        placeholder='email@email.com'
    />
    <PasswordInput
        label="Password"
        name="password"
        bind:value={$form.password}
        errors={$errors.password}
        constraints={$constraints.password}
        placeholder='Passw0rd1234'
    />
    <button class="btn">Submit</button>
</form>