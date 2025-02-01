<script lang="ts">
    import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
    import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import User from '$lib/displayComponents/User.svelte';
	import Header from '$lib/Header.svelte';
	import { fade } from 'svelte/transition';
    import type { PageData } from './$types';
	import UnitNotesForm from '$lib/forms/UnitNotesForm.svelte';
	import UnitPricingForm from '$lib/forms/UnitPricingForm.svelte';
	import LeaseEndForm from '$lib/forms/LeaseEndForm.svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import HorizontalDivider from '$lib/displayComponents/HorizontalDivider.svelte';
	import Revenue from '$lib/displayComponents/Revenue.svelte';
	import VerticalDivider from '$lib/displayComponents/VerticalDivider.svelte';

    let modalOpen = $state(false);
    let currentLeaseId = $state('')
    let { data }: { data: PageData } = $props();
    const formattedCurrency = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})
</script>

{#await data.unit}
<Header title='loading...' />
...loading unit
{:then unit}
<Modal
    bind:open={modalOpen}
    contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
    backdropClasses="backdrop-blur-sm"
>
{#snippet content()}
    <LeaseEndForm data={data.leaseEndForm} leaseId={currentLeaseId} />
{/snippet}
</Modal>
    {#if unit}
    <Header title='Unit number: {unit.num}' />
    <div transition:fade={{duration:600}}>
        <UnitEmployee {unit} widthClass='w-1/4'/>
        <Revenue label='Total revenue from this unit' amount={data.totalRevenue} />
        <UnitNotesForm data={data.unitNotesForm} {unit} widthClass='w-1/4'/>
        <HorizontalDivider />
        <UnitPricingForm data={data.unitPricingForm} size={unit.size} oldPrice={unit.advertisedPrice} unitPricingFormModalOpen={modalOpen} />
        <HorizontalDivider />
        {#each data.leases as lease}
            {@const { customer } = lease}
                <div class="flex">
                    {#if !lease.leaseEnded}
                        <div class="flex">
                            <LeaseEmployee {lease} widthClass='w-1/4'/>
                            <button class="btn" onclick={()=>{modalOpen=true; currentLeaseId=lease.leaseId}}>End lease</button>
                        </div> 
                        <VerticalDivider heightClass='h-30' />                      
                        {#if customer}
                            <User user={customer} widthClass='w-1/4'/>
                        {/if}
                        {:else}
                            <LeaseEmployee {lease} widthClass='w-1/4'/>
                            <VerticalDivider heightClass='h-30' />
                        {#if customer}
                            <User user={customer} widthClass='w-1/4'/>
                        {/if}
                    {/if}
                </div>
                <HorizontalDivider />
        {/each}
    </div>
    {/if}
{/await}