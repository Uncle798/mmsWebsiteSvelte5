<script lang="ts">
    import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
    import { Modal } from '@skeletonlabs/skeleton-svelte';
    import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import User from '$lib/displayComponents/User.svelte';
    import type { PageData } from './$types';
	import LeaseEndForm from '$lib/forms/LeaseEndForm.svelte';
	import UnitNotesForm from '$lib/forms/UnitNotesForm.svelte';
	import UnitPricingForm from '$lib/forms/UnitPricingForm.svelte';
	import Header from '$lib/Header.svelte';
    import { fade } from 'svelte/transition';

    let { data }: { data: PageData } = $props();
    let { units, leases, customers,} = data;
    let modalOpen = $state(false);
    let currentLeaseId = $state('');
    let globalModalType = $state('');
    let currentSize = $state('');
    let currentOldPrice = $state();
    function openModal(modalType:string, leaseId?:string, size?:string, oldPrice?:number) {
        if(leaseId){
            currentLeaseId=leaseId;
        }
        if(size){
            currentSize = size;
            currentOldPrice = oldPrice;
        }
        globalModalType=modalType;
        modalOpen = true;
    }
</script>
<Header title='All units' />

<Modal
    bind:open={modalOpen}
    contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
    backdropClasses="backdrop-blur-sm"
    >
    {#snippet content()}
        {#if globalModalType === 'lease'}
        {#if data.leaseEndForm}
            <LeaseEndForm data={data.leaseEndForm} leaseId={currentLeaseId} customer={false} bind:leaseEndModalOpen={modalOpen}/>
        {/if}
        {:else if globalModalType === 'unitPricing'}
            <UnitPricingForm data={data.unitPricingForm} bind:unitPricingFormModalOpen={modalOpen} size={currentSize} oldPrice={currentOldPrice} />
        {/if}
        <button class="btn" onclick={()=>modalOpen = false}>Cancel</button>
    {/snippet}
</Modal>

{#if !units}
    ...loading units
    {:else}
    {#each units as unit}
        {@const lease = leases?.find((lease) => lease.unitNum === unit.num)}
        <div class="flex" transition:fade={{duration:600}}>
            <div>
                <UnitEmployee unit={unit} />
                <button class="btn" onclick={()=> openModal('unitPricing', '',unit.size, unit.advertisedPrice)}>Change all {unit.size.replace(/^0+/gm,'').replace(/x0/gm,'x')} pricing</button>
            </div>
            {#if data.unitNotesForm}
                <UnitNotesForm data={data.unitNotesForm} unitNum={unit.num} available={unit.unavailable}/>
            {/if}
            {#if lease}
                {@const customer = customers?.find((customer) => customer.id === lease.customerId)}
                <div>
                    <LeaseEmployee lease={lease} />
                    <button class="btn" onclick={()=>openModal('lease', lease.leaseId)}>End Lease</button>
                </div>
                {#if customer}
                    <User user={customer} />
                {/if}
            {/if}
        </div>
    {/each}
{/if}
