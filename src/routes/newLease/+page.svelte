<script lang="ts">
    import Address from '$lib/displayComponents/Address.svelte';
    import AddressForm from '../forms/addressForm/+page.svelte'
    import { Modal, Progress, ProgressRing } from '@skeletonlabs/skeleton-svelte';
    import { superForm } from 'sveltekit-superforms';
    import type { PageData } from './$types';
	import UnitCustomer from '$lib/displayComponents/UnitCustomer.svelte';
	import User from '$lib/displayComponents/User.svelte';
	import Checkbox from '$lib/formComponents/Checkbox.svelte';
    
    let { data }: {data:PageData} = $props();
    let { form, message, errors, constraints, enhance, delayed, timeout } = superForm(data.leaseForm);
    let addressModalOpen = $state(false);
</script>
{#if data.user}
    <User user={data.user} />
{/if}
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
        <button class="btn">The above is correct please email me my lease.</button>
    {/if}
    {#if $delayed && !$timeout}
        <ProgressRing value={null} size="size-14" meterStroke="stroke-tertiary-600-400" trackStroke="stroke-tertiary-50-950" />
    {/if}
    {#if $timeout}
        <Progress value={null} />
    {/if}
</form>