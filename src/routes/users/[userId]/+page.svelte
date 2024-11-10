<script lang="ts">
    import { Modal } from '@skeletonlabs/skeleton-svelte';
    import { superForm } from 'sveltekit-superforms';
    import type { PageData } from './$types';
    import AddressForm from '../../forms/addressForm/+page.svelte'
    import NameForm from '../../forms/nameForm/+page.svelte'
	import Address from '$lib/displayComponents/Address.svelte';
    
    let {data}:{ data: PageData} = $props();
    const { form, errors, message, constraints, enhance } = superForm(data.addressForm)
    let addressModalOpen = $state(false);
    let nameModalOpen = $state(false);
</script>
<h1 class="h1">{data.user?.givenName} {data.user?.familyName}</h1>
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
        Change Address
    {/snippet}
    {#snippet content()}
        <AddressForm data={data.addressForm} />
    {/snippet}
</Modal>
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
        <NameForm data={data.nameForm} />
    {/snippet}
</Modal>