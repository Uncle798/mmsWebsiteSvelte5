<script lang="ts">
    import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";  
    import TextInput from '$lib/formComponents/textInput.svelte';
    import type { EmailVerificationFormSchema } from "$lib/formSchemas/schemas";
	import { Progress, ProgressRing } from '@skeletonlabs/skeleton-svelte';
    
    let {data, emailVerificationOpen=$bindable(true)}: {data:SuperValidated<Infer<EmailVerificationFormSchema>>, emailVerificationOpen:boolean} = $props();
    let { form, errors, constraints, message, enhance, submitting, delayed, timeout } = superForm(data, {
        onUpdated(){
            emailVerificationOpen=false;
        },
        dataType: 'json'
    });
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
    {#if $delayed && !$timeout}
    <ProgressRing value={null} size="size-14" meterStroke="stroke-tertiary-600-400" trackStroke="stroke-tertiary-50-950" />
 {/if}
 {#if $timeout}
    <Progress value={null} />
 {/if}
</form>

<form action="/register/emailVerification?/resend" use:enhance method="POST">
    <button class="btn">Resend email</button>
</form>