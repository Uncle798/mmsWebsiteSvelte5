<script lang="ts">
    import Address from '$lib/displayComponents/Address.svelte';
    import AddressForm from '../../lib/forms/AddressForm.svelte'
    import { Modal, } from '@skeletonlabs/skeleton-svelte';
    import FormProgress from '$lib/formComponents/FormProgress.svelte';
    import { superForm } from 'sveltekit-superforms';
    import type { PageData } from './$types';
	import UnitCustomer from '$lib/displayComponents/UnitCustomer.svelte';
	import User from '$lib/displayComponents/User.svelte';
	import Checkbox from '$lib/formComponents/Checkbox.svelte';
	import FormMessage from '$lib/formComponents/FormMessage.svelte';
    
    let { data }: {data:PageData} = $props();
    let { form, message, errors, constraints, enhance, delayed, timeout } = superForm(data.leaseForm);
    let addressModalOpen = $state(false);
</script>
{#if data.user}
    <User user={data.user} />
{/if}
<FormMessage message={$message} />
<form method="post" use:enhance>
    {#if data.user?.organizationName}
        <Checkbox
            bind:value={$form.organization}
            errors={$errors.organization}
            constraints={$constraints.organization}
            name='organization'
            label='This unit is being rented by an organization'
        />
    {/if}
    {#if data.address}
        <Address address={data.address} />
    {:else}
        <Modal
            bind:open={addressModalOpen}
            triggerBase="btn preset-tonal"
            contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
            backdropClasses="backdrop-blur-sm"
        >
        {#snippet trigger()}
            Add address
        {/snippet}
        {#snippet content()}
            <AddressForm data={data.addressForm} bind:addressModalOpen={addressModalOpen}/>
            <button class="btn" onclick={()=>addressModalOpen=false}>Close</button>
        {/snippet}
    </Modal>
    {/if}
    {#if data.unit}
        <UnitCustomer unit={data.unit} />
        <input type="hidden" name="unitNum" value={data.unit.num}>
    {/if}
    
    {#if data.unit && data.address}
        <button class="btn">The above is correct I would like to pay my deposit</button>
    {/if}
    <FormProgress delayed={$delayed} timeout={$timeout}/>
</form>