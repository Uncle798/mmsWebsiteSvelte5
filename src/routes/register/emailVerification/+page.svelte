<script lang="ts">
    import { superForm } from "sveltekit-superforms";  
    import TextInput from '$lib/formComponents/textInput.svelte';
    import type { PageData } from './$types';
    
    export let data: PageData;
    const { form, errors, constraints, message, enhance } = superForm(data.emailVerificationForm);
</script>

{#if $message}
    {$message}
{/if}
<form method="post" action="/register/emailVerification?/verify" use:enhance>
    <TextInput
        label="Code: "
        name="code"
        bind:value={$form.code}
        errors={$errors.code}
        constraints={$constraints.code}
        placeholder='12345678'
    />
    <button class="btn">Submit</button>
</form>

<form action="/register?/resend" use:enhance method="POST">
    <button class="btn">Resend email</button>
</form>