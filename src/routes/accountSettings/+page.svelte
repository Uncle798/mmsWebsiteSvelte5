<script lang="ts">
    import { Modal } from '@skeletonlabs/skeleton-svelte';
    import type { PageData } from './$types';
    import AddressForm from '$lib/forms/AddressForm.svelte';
    import NameForm from '$lib/forms/NameChangeForm.svelte';
    import EmailForm from '$lib/forms/EmailChangeForm.svelte';
    import EmailVerification from '$lib/forms/EmailVerificationForm.svelte'
	import Address from '$lib/displayComponents/Address.svelte';
	import Header from '$lib/Header.svelte';
	import { BadgeCheck, } from 'lucide-svelte';
	import LeaseCustomer from '$lib/displayComponents/LeaseCustomer.svelte';
	import LeaseEndForm from '$lib/forms/LeaseEndForm.svelte';
	import { blur } from 'svelte/transition';
    
    let {data}:{ data: PageData} = $props();
    let addressModalOpen = $state(false);
    let nameModalOpen = $state(false);
    let emailModalOpen = $state(false);
    let emailVerification = $state(false);
    let emailVerificationModalOpen = $state(false);
    let leaseEndModalOpen = $state(false);
    let currentLeaseId = $state('');
    function setCurrentLeaseId(leaseId:string){
        currentLeaseId = leaseId;
        leaseEndModalOpen = true;
    }
</script>
<Header title='Settings for {data.user?.givenName}' />

<div transition:blur={{duration:600}}>


<span class="h1">{data.user?.givenName} {data.user?.familyName}</span>
{#if data.user?.organizationName}
    <span class="h2">{data.user.organizationName}</span>
{/if}
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
        <div class=" p-1">
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
        {#if !emailVerification}
            <EmailForm data={data.emailForm} bind:emailModalOpen={emailModalOpen} bind:emailVerification={emailVerification} />
        {:else}
            <EmailVerification data={data.emailVerificationForm} bind:emailVerificationModalOpen={emailVerificationModalOpen} redirect='false' bind:emailVerification={emailVerification}/>
            {/if}
            <button class="btn" onclick={()=>emailModalOpen = false}>Cancel</button>
        {/snippet}
</Modal>
    
<Modal
    bind:open={emailVerificationModalOpen}
    contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
    backdropClasses="backdrop-blur-sm"
    >
    {#snippet content()}
        <EmailVerification data={data.emailVerificationForm} bind:emailVerificationModalOpen={emailVerificationModalOpen} redirect='false' bind:emailVerification={emailVerification}/>
        <button class="btn" onclick={()=>emailVerificationModalOpen = false}>Cancel</button>
    {/snippet}
</Modal>

{#await data.addressPromise}
    ...loading address
{:then address} 
    {#if address}
        <Address address={address} />
    {/if}
    
    <Modal
        bind:open={addressModalOpen}
        triggerBase="btn preset-tonal"
        contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
        backdropClasses="backdrop-blur-sm"
    >
    {#snippet trigger()}
        {#if address}
            Change Address
        {:else}
            Add address
        {/if}
    {/snippet}
    {#snippet content()}
        <AddressForm data={data.addressForm} bind:addressModalOpen={addressModalOpen} userId={data.user?.id!}/>
        <button class="btn" onclick={()=>addressModalOpen=false}>Close</button>
    {/snippet}
</Modal>
{/await}

{#await data.leasesPromise}
    ...loading leases
{:then leases}
    {#if leases}
    <Modal 
        bind:open={leaseEndModalOpen}
        triggerBase="btn preset-tonal"
        contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
        backdropClasses="backdrop-blur-sm"
    >
        {#snippet content()}
            <LeaseEndForm data={data.leaseEndForm} bind:leaseEndModalOpen={leaseEndModalOpen} leaseId={currentLeaseId} customer={data.user?.employee}/>
            <button class="btn" onclick={()=>leaseEndModalOpen=false}>Cancel</button>
        {/snippet}
    </Modal>
        {#each leases as lease}
            <LeaseCustomer lease={lease} />
            {#if !lease.leaseEnded}
            <button class="btn preset-tonal p-4" onclick={()=> setCurrentLeaseId(lease.leaseId)}>End Lease</button>
            {/if}
        {/each}
    {/if}
{/await}

</div>