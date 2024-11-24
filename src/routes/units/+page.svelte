<script lang="ts">
    import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
    import { Modal } from '@skeletonlabs/skeleton-svelte';
    import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import User from '$lib/displayComponents/User.svelte';
    import type { PageData } from './$types';
	import LeaseEndForm from '$lib/forms/LeaseEndForm.svelte';
	import UnitNotesForm from '$lib/forms/UnitNotesForm.svelte';

    let { data }: { data: PageData } = $props();
    let { units, leases, customers,} = data;
    let modalOpen = $state(false);
    let currentLeaseId = $state('');
    function openModal(leaseId:string) {
        currentLeaseId=leaseId;
        modalOpen = true;
    }
</script>
<Modal
    bind:open={modalOpen}
    contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
    backdropClasses="backdrop-blur-sm"
    >
    {#snippet content()}
        {#if data.leaseEndForm}
            <LeaseEndForm data={data.leaseEndForm} leaseId={currentLeaseId} customer={false} bind:leaseEndModalOpen={modalOpen}/>
        {/if}
        <button class="btn" onclick={()=>modalOpen = false}>Cancel</button>
    {/snippet}
</Modal>

{#if !units}
    ...loading units
    {:else}
    {#each units as unit}
        {@const lease = leases?.find((lease) => lease.unitNum === unit.num)}
        <div class="flex">
            <UnitEmployee unit={unit} />
            {#if data.unitNotesForm}
                <UnitNotesForm data={data.unitNotesForm} unitNum={unit.num} available={unit.unavailable}/>
            {/if}
            {#if lease}
                {@const customer = customers?.find((customer) => customer.id === lease.customerId)}
                <div>
                    <LeaseEmployee lease={lease} />
                    <button class="btn" onclick={()=>openModal(lease.leaseId)}>End Lease</button>
                </div>
                {#if customer}
                    <User user={customer} />
                {/if}
            {/if}
        </div>
    {/each}
{/if}
