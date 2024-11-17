<script lang="ts">
    import { Modal } from '@skeletonlabs/skeleton-svelte';
    import type { PageData } from './$types';
    import AddressForm from '$lib/forms/AddressForm.svelte';
    import NameForm from '$lib/forms/NameChangeForm.svelte';
    import EmailForm from '$lib/forms/EmailChangeForm.svelte';
    import EmailVerification from '$lib/forms/EmailVerificationForm.svelte'
	import Address from '$lib/displayComponents/Address.svelte';
	import Header from '$lib/Header.svelte';
	import { BadgeCheck, Check, Verified } from 'lucide-svelte';
    
    let {data}:{ data: PageData} = $props();
    let addressModalOpen = $state(false);
    let nameModalOpen = $state(false);
    let emailModalOpen = $state(false);
    let emailVerificationModalOpen = $state(false);
</script>
<Header title='Settings for {data.user?.givenName}' />

<span class="h1">{data.user?.givenName} {data.user?.familyName}</span>
<Modal
bind:open={nameModalOpen}
triggerBase="btn preset-tonal"
contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
backdropClasses="backdrop-blur-sm"
>
    {#snippet trigger()}
        Change Name
    {/snippet}
    {#snippet content()}
        <NameForm data={data.nameForm} bind:nameModalOpen={nameModalOpen} />
        <button class="btn" onclick={()=>nameModalOpen=false}>Cancel</button>
    {/snippet}
</Modal>

<span class="h4 flex">{data.user?.email}
    {#if data.user?.emailVerified}
    <div class="flex p-1">
        <BadgeCheck />  
        <div class="h6 p-1">
            Email Verified
        </div>
    </div>
    
    {:else}
    <button class="btn h6" onclick={()=>emailVerificationModalOpen=true}>Please confirm your email address</button>
    {/if}
</span>
<Modal
    bind:open={emailModalOpen}
    triggerBase="btn preset-tonal"
    contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
    backdropClasses="backdrop-blur-sm"
>
    {#snippet trigger()}
        Change email address
    {/snippet}
    {#snippet content()}
        <EmailForm data={data.emailForm} bind:emailModalOpen={emailModalOpen} bind:emailVerificationModalOpen={emailVerificationModalOpen} />
        <button class="btn" onclick={()=>emailModalOpen = false}>Cancel</button>
        {/snippet}
</Modal>
        
<Modal
    bind:open={emailVerificationModalOpen}
    contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
    backdropClasses="backdrop-blur-sm"
    >
    {#snippet content()}
        <EmailVerification data={data.emailVerificationForm} bind:emailVerificationModalOpen={emailVerificationModalOpen} redirect='false'/>
        <button class="btn" onclick={()=>emailVerificationModalOpen = false}>Cancel</button>
    {/snippet}
</Modal>

{#if data.address}
    <Address address={data.address} />
{/if}

<Modal
	bind:open={addressModalOpen}
	triggerBase="btn preset-tonal"
	contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
	backdropClasses="backdrop-blur-sm"
>
    {#snippet trigger()}
        {#if data.address}
            Change Address
        {:else}
            Add address
        {/if}
    {/snippet}
    {#snippet content()}
        <AddressForm data={data.addressForm} bind:addressModalOpen={addressModalOpen}/>
        <button class="btn" onclick={()=>addressModalOpen=false}>Close</button>
    {/snippet}
</Modal>