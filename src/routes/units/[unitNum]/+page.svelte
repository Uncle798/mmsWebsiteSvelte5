<script lang="ts">
    import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
    import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import Header from '$lib/Header.svelte';
	import { fade } from 'svelte/transition';
    import type { PageData } from './$types';
	import UnitNotesForm from '$lib/forms/UnitNotesForm.svelte';
	import UnitPricingForm from '$lib/forms/UnitPricingForm.svelte';
	import LeaseEndForm from '$lib/forms/LeaseEndForm.svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import Revenue from '$lib/displayComponents/Revenue.svelte';
	import Address from '$lib/displayComponents/AddressEmployee.svelte';

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
        <div transition:fade={{duration:600}} class="m-2">
            <UnitEmployee {unit} classes=''/>
            <Revenue label='Total revenue from this unit' amount={data.totalRevenue} />
            <UnitNotesForm data={data.unitNotesForm} {unit} classes=''/>
            <UnitPricingForm data={data.unitPricingForm} size={unit.size} oldPrice={unit.advertisedPrice} unitPricingFormModalOpen={modalOpen} />
            <div class="grid grid-cols-1 gap-y-3 gap-x-1">
                {#each data.leases as lease}
                {@const customer = data.customers.find((customer) => customer.id === lease.customerId)}
                    {#if !lease.leaseEnded}
                        <div class="rounded-lg border-2 border-primary-50 dark:border-primary-950">
                            <div class="flex flex-col ">
                                <LeaseEmployee {lease}/>
                                <button class="btn" onclick={()=>{modalOpen=true; currentLeaseId=lease.leaseId}}>End lease</button>
                            </div>                 
                            {#if customer}  
                            {@const address = data.addresses.find((address) => address.userId === customer.id)}
                            <div class="flex flex-col p-2">
                                <UserEmployee user={customer}/>
                                {#if address}
                                <Address {address} />
                                {/if}
                            </div>
                            {/if}
                        </div>
                    {:else}
                        <div class="rounded-lg border-2 border-primary-50 dark:border-primary-950">
                            <LeaseEmployee {lease} classes=''/>
                            {#if customer}
                            {@const address = data.addresses.find((address) => address.userId === customer.id)}
                                <div class="flex flex-col sm:p-2 px-2 ">
                                    <UserEmployee user={customer}/>
                                    {#if address}
                                        <Address {address} />
                                    {/if}
                                </div>
                            {/if}
                        </div>
                    {/if}
                {/each}
            </div>
        </div>
    {/if}
{/await}