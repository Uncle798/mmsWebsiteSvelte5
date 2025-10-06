<script lang="ts">
	import Header from "$lib/Header.svelte";
	import EmailVerificationForm from "$lib/forms/EmailVerificationForm.svelte";
	import type { PageData } from "./$types";
    
    let {data, emailVerificationOpen=$bindable(false)}: {data:PageData, emailVerificationOpen:boolean} = $props();
    let  redirectTo= $state(data.redirectTo);
    if(!data.redirectTo){
        redirectTo = 'home'
    }
</script>

<Header title='Email Verification' />
{#if data.emailVerificationForm}
   {#if data.user}
      <EmailVerificationForm 
         data={data.emailVerificationForm} 
         emailVerificationModalOpen={emailVerificationOpen} 
         redirect={redirectTo}
         classes='m-2 mt-14 sm:mt-10'
         userId={data.user.id}
      />
   {/if}
{/if}