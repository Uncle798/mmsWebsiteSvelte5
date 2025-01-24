<script lang="ts">
    import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
    import { Modal, Pagination } from '@skeletonlabs/skeleton-svelte';
    import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import User from '$lib/displayComponents/User.svelte';
    import type { PageData } from './$types';
	import LeaseEndForm from '$lib/forms/LeaseEndForm.svelte';
	import UnitNotesForm from '$lib/forms/UnitNotesForm.svelte';
	import UnitPricingForm from '$lib/forms/UnitPricingForm.svelte';
	import Header from '$lib/Header.svelte';
    import {superForm } from 'sveltekit-superforms'
    
    import { fade } from 'svelte/transition';
	import type { Unit } from '@prisma/client';

    let { data }: { data: PageData } = $props();
    let { units, leases, customers,} = data;
    let modalOpen = $state(false);
    let currentLeaseId = $state('');
    let globalModalType = $state('');
    let currentSize = $state('');
    let currentOldPrice = $state();
    let unitSearch = $state('');
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
    let { form, enhance, message } = superForm(data.searchForm,{
        onChange(event){
            const inputText = event.get('search')
            if(inputText){
                unitSearch=inputText!;
            }
        },
    });
    let pageNum = $state(1);
    let size = $state(25);
    let slicedUnits = $derived((units:Unit[]) => units.slice((pageNum-1)*size, pageNum*size));
    let filteredUnits = $derived((units:Unit[]) => units.filter((unit) => unit.num.toString().includes(unitSearch)))
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
            <UnitPricingForm data={data.unitPricingForm!} bind:unitPricingFormModalOpen={modalOpen} size={currentSize} oldPrice={currentOldPrice} />
        {/if}
        <button class="btn" onclick={()=>modalOpen = false}>Cancel</button>
    {/snippet}
</Modal>

{#if !units}
    ...loading units
    {:else}
    <div>
        <input type="search" name="search" id="search" bind:value={$form.search} class="input" placeholder="Search by unit number..."/>
        <button type="button" class="btn" onclick={()=>{ unitSearch=''; $form.search = ''}}>Clear</button>
    </div>
    
    {#each slicedUnits(filteredUnits(units)) as unit (unit.num)}
        {@const lease = leases?.find((lease) => lease.unitNum === unit.num)}
        <div class="flex" transition:fade={{duration:600}}>
            <div>
                <UnitEmployee unit={unit} />
                <button class="btn" onclick={()=> openModal('unitPricing', '',unit.size, unit.advertisedPrice)}>Change all {unit.size.replace(/^0+/gm,'').replace(/x0/gm,'x')} pricing</button>
            </div>
            {#if data.unitNotesForm}
                <UnitNotesForm data={data.unitNotesForm} unit={unit}/>
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
    <footer class="flex justify-between">
        <select name="size" id="size" class="select" bind:value={size}>
           {#each [5,10,25,50] as v}
           <option value={v}>Show {v} units per page</option>
           {/each}
           <option value={units.length}>Show all {units.length} units</option>
        </select>
        <Pagination data={units} bind:page={pageNum} bind:pageSize={size} alternative/>
     </footer>
{/if}
