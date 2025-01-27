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

    let modalOpen = $state(false);
    let currentLeaseId = $state('')
    let { data }: { data: PageData } = $props();
    const formattedCurrency = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})
</script>

<Modal
    bind:open={modalOpen}
    contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
    backdropClasses="backdrop-blur-sm"
>
{#snippet content()}
    <LeaseEndForm data={data.leaseEndForm} leaseId={currentLeaseId} />
{/snippet}
</Modal>
{#if !data.unit}
<Header title='loading...' />
...loading unit
{:else}
    <Header title='Unit number: {data.unit.num}' />
    <div transition:fade={{duration:600}}>
        <div class="flex">
            <UnitEmployee unit={data.unit}/>
            Total revenue from this unit: {formattedCurrency.format(data.totalRevenue)}
        </div>
        <UnitNotesForm data={data.unitNotesForm} unit={data.unit} />
        <UnitPricingForm data={data.unitPricingForm} size={data.unit.size} oldPrice={data.unit.advertisedPrice} unitPricingFormModalOpen={modalOpen} />
        {#each data.leases as lease}
            {@const { customer } = lease}
                <div class="flex">
                    {#if !lease.leaseEnded}                        
                        <LeaseEmployee lease={lease} />
                        <button class="btn" onclick={()=>{modalOpen=true; currentLeaseId=lease.leaseId}}>End lease</button>
                        {#if customer}
                            <User user={customer} />
                        {/if}
                        {:else}
                        <LeaseEmployee lease={lease} />
                        {#if customer}
                            <User user={customer} />
                        {/if}

                    {/if}
                </div>
        {/each}
    </div>
{/if}