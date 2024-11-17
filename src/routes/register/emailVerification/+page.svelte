<script lang="ts">
	import Header from "$lib/Header.svelte";
	import EmailVerificationForm from "$lib/forms/EmailVerificationForm.svelte";
	import type { PageData } from "./$types";
    
    let {data, emailVerificationOpen=$bindable(false)}: {data:PageData, emailVerificationOpen:boolean} = $props();

</script>

    <Header title='Email Verification' />
    {#if data.emailVerificationForm}
        <EmailVerificationForm data={data.emailVerificationForm} emailVerificationModalOpen={emailVerificationOpen} redirect='home'/>
    {/if}