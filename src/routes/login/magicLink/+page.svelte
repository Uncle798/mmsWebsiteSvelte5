<script lang="ts">
    import { superForm } from 'sveltekit-superforms';
    import type { PageData } from './$types';
	import FormMessage from '$lib/formComponents/FormMessage.svelte';
	import EmailInput from '$lib/formComponents/EmailInput.svelte';
	import FormSubmitWithProgress from '$lib/formComponents/FormSubmitWithProgress.svelte';
	import type { ToastContext } from '@skeletonlabs/skeleton-svelte';
	import { getContext, onMount } from 'svelte';

    let { data }: { data: PageData } = $props();
    let { form, message, errors, constraints, enhance, delayed, timeout } = superForm(data.magicLinkForm);
    export const toast:ToastContext = getContext('toast');
    const toastReason = data.toastReason
    onMount(()=> {
        if(toastReason === 'linkExpired'){
            toast.create({
                title: 'The link has expired',
                description: 'Links are only valid for 5 minutes, please enter your email address again',
                type: 'error'
            })

        }
    })
</script>

<FormMessage message={$message} />

<form method="post" use:enhance >
    <EmailInput
        bind:value={$form.email}
        errors={$errors.email}
        constraints={$constraints.email}
        label='Registered email address: '
        name='email'
    />
    <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText='Email me a link to login'/>
</form>
<a href="/register?redirectTo={data.redirectTo}&unitNum={data.unitNum}" class="btn">Register new account</a>