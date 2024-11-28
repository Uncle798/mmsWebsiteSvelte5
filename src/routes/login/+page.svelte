<script lang="ts">
    import EmailInput from '$lib/formComponents/EmailInput.svelte';
    import { getContext, onMount } from 'svelte';
    import FormProgress from '$lib/formComponents/FormSubmitWithProgress.svelte';
    import type { ToastContext, } from '@skeletonlabs/skeleton-svelte'
	import { superForm } from 'sveltekit-superforms';
    import type { PageData } from './$types';
	import PasswordInput from '$lib/formComponents/PasswordInput.svelte';
	import FormMessage from '$lib/formComponents/FormMessage.svelte';
	import Header from '$lib/Header.svelte';
    
    export let data: PageData;
    let { form, message, errors, constraints, enhance, delayed, timeout } = superForm(data.loginForm);
    export const toast:ToastContext = getContext('toast');
    const toastReason = data.toast;
    onMount(() => {
        if(toastReason === 'userAlreadyExists'){
            toast.create({
                title: 'Email already in use',
                description: 'That email has been used already please login',
                type: 'info'
            })
        }
        if(toastReason === 'unauthorized'){
            toast.create({
                title: 'You must be logged in to access that page',
                description: 'To access that page please log in',
                type: 'error'
            })
        }
        if(toastReason === 'admin'){
            toast.create({
                title: 'Unauthorized',
                description: 'To access that page you must be an Administrator',
                type: 'error'
            })
        }
        if(toastReason === 'employee'){
            toast.create({
                title: 'Unauthorized',
                description: 'To access that page you must be an employee',
                type: 'error'
            })
        }
    })
</script>
<Header title='Login' />

<FormMessage message={$message} />
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
    <FormProgress delayed={$delayed} timeout={$timeout}/>  
</form>
<a href="/register" class="btn">Register new account</a>