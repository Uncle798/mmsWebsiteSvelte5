<script lang="ts">
    import { Modal } from '@skeletonlabs/skeleton-svelte';
    import type { PageData } from './$types';
    import AddressForm from '../../forms/addressForm/+page.svelte';
    import NameForm from '../../forms/nameForm/+page.svelte';
    import EmailForm from '../../forms/emailUpdateForm/+page.svelte';
    import EmailVerification from '../../register/emailVerification/+page.svelte'
	import Address from '$lib/displayComponents/Address.svelte';
    
    let {data}:{ data: PageData} = $props();
    let addressModalOpen = $state(false);
    let nameModalOpen = $state(false);
    let emailModalOpen = $state(false);
    let emailVerificationOpen = $state(false);
</script>

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

<span class="h4">{data.user?.email}</span>
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
        <EmailForm data={data.emailForm} bind:emailModalOpen={emailModalOpen} bind:emailVerificationOpen={emailVerificationOpen} />
        <button class="btn" onclick={()=>emailModalOpen = false}>Cancel</button>
    {/snippet}
</Modal>

<Modal
    bind:open={emailVerificationOpen}
    contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
    backdropClasses="backdrop-blur-sm"
>
    {#snippet content()}
        <EmailVerification data={data.emailVerificationForm} bind:emailVerificationOpen={emailVerificationOpen} />
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