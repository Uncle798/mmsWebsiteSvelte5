<script lang="ts">
    import { Modal } from '@skeletonlabs/skeleton-svelte';
    import type { PageData } from './$types';
    import AddressForm from '../../forms/addressForm/+page.svelte';
	import Address from '$lib/displayComponents/Address.svelte';
    
    let {data}:{ data: PageData} = $props();
    let addressModalOpen = $state(false);

    let address = $state(data.address);
    $effect(()=>{
        address = data.address
    })
</script>


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