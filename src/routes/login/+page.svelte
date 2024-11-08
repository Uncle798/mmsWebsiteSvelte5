<script lang="ts">
    import EmailInput from '$lib/formComponents/EmailInput.svelte';
    import { getContext, onMount } from 'svelte';
    import type { ToastContext } from '@skeletonlabs/skeleton-svelte'
	import { superForm } from 'sveltekit-superforms';
    import type { PageData } from './$types';
	import PasswordInput from '$lib/formComponents/PasswordInput.svelte';
    
    export let data: PageData;
    let { form, message, errors, constraints, enhance } = superForm(data.loginForm);
    export const toast:ToastContext = getContext('toast');
    const toastReason = data.toast;
    onMount(() => {
        (async ()=>{
            if(toastReason === 'userAlreadyExists'){
                toast.create({
                    title: 'Email already in use',
                    description: 'That email has been used already please login',
                    type: 'info'
                })
            }
        })
    })
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