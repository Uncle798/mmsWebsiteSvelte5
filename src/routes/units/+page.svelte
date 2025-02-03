<script lang="ts">
	import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import Placeholder from '$lib/displayComponents/Placeholder.svelte';
	import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import User from '$lib/displayComponents/User.svelte';
	import type { PageData } from './$types';
	import LeaseEndForm from '$lib/forms/LeaseEndForm.svelte';
	import UnitNotesForm from '$lib/forms/UnitNotesForm.svelte';
	import UnitPricingForm from '$lib/forms/UnitPricingForm.svelte';
	import Header from '$lib/Header.svelte';

	import { fade } from 'svelte/transition';
	import type { Unit } from '@prisma/client';
	import VerticalDivider from '$lib/displayComponents/VerticalDivider.svelte';
	let { data }: { data: PageData } = $props();
	let { units } = data;
	let modalOpen = $state(false);
	let currentLeaseId = $state('');
	let globalModalType = $state('');
	let currentSize = $state('');
	let currentOldPrice = $state(0);
	let unitSearch = $state('');
	function openModal(modalType: string, oldPrice: number, leaseId?: string, size?: string) {
		if (leaseId) {
			currentLeaseId = leaseId;
		}
		if (size) {
			currentSize = size;
			currentOldPrice = oldPrice;
		}
		globalModalType = modalType;
		modalOpen = true;
	}
	let search = $state('');
	let pageNum = $state(1);
	let size = $state(25);
	let slicedUnits = $derived((units: Unit[]) => units.slice((pageNum - 1) * size, pageNum * size));
	let filteredUnits = $derived((units: Unit[]) =>
		units.filter((unit) => unit.num.toString().includes(search))
	);
</script>

<Header title="All units" />

<Modal
	bind:open={modalOpen}
	contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
	backdropClasses="backdrop-blur-sm"
>
	{#snippet content()}
		{#if globalModalType === 'lease'}
			{#if data.leaseEndForm}
				<LeaseEndForm
					data={data.leaseEndForm}
					leaseId={currentLeaseId}
					customer={false}
					bind:leaseEndModalOpen={modalOpen}
				/>
			{/if}
		{:else if globalModalType === 'unitPricing'}
			<UnitPricingForm
				data={data.unitPricingForm!}
				bind:unitPricingFormModalOpen={modalOpen}
				size={currentSize}
				oldPrice={currentOldPrice}
			/>
		{/if}
		<button class="btn" onclick={() => (modalOpen = false)}>Cancel</button>
	{/snippet}
</Modal>

{#await data.units}
    loading units
    <Placeholder />
{:then units} 
    {#await data.leases}
        loading leases
        <Placeholder />
    {:then leases} 
        {#await data.customers}
            loading customers 
            <Placeholder />
        {:then customers}
            {#if units}   
            <div class="grid container grid-cols-4 grid-rows-{slicedUnits(filteredUnits(units)).length} auto-cols-max gap-0" transition:fade={{duration:600}}>
                {#each slicedUnits(filteredUnits(units)) as unit (unit.num)}
                {@const lease = leases?.find((lease) => lease.unitNum === unit.num)}
                        <div class="w-full border-r-2 border-b-2 border-primary-950 rounded-sm">
                            <UnitEmployee {unit} classes=''/>
                            <button class="btn bg-primary-900 rounded-lg" onclick={()=> openModal('unitPricing', unit.advertisedPrice, '', unit.size)}>Change all {unit.size.replace(/^0+/gm,'').replace(/x0/gm,'x')} pricing</button>
                        </div>
                        {#if data.unitNotesForm}
                            <UnitNotesForm data={data.unitNotesForm} {unit} classes='min-w-80 border-r-2 border-b-2 border-primary-950'/>
                        {/if}
                        {#if lease}
                        {@const customer = customers?.find((customer) => customer.id === lease.customerId)}
                            <div class="w-full min-w-80 border-r-2 border-b-2 border-primary-950">
                                <LeaseEmployee {lease} classes='w-80 p-4'/>
                                <button class="btn bg-primary-900 rounded-lg" onclick={()=>openModal('lease', 0, lease.leaseId)}>End Lease</button>
                            </div>
                            {#if customer}
                                <User user={customer} classes='w-full border-b-2 border-primary-950 '/>
                            {:else}
                                <div class="w-full border-b-2 border-primary-950 min-w-80" ></div>
                            {/if}
                            {:else}
                            <div class="w-full border-r-2 border-b-2 border-primary-950"></div>
                        {/if}
                    {/each}
                </div>
            <Pagination pageNum={pageNum} size={size} array={filteredUnits(units)} label='units'/>
            {/if}
        {/await}    
    {/await}
	loading units
	<Placeholder />
{:then units}
	{#await data.leases}
		loading leases
		<Placeholder />
	{:then leases}
		{#await data.customers}
			loading customers
			<Placeholder />
		{:then customers}
			{#if units}
				{#each slicedUnits(filteredUnits(units)) as unit (unit.num)}
					{@const lease = leases?.find((lease) => lease.unitNum === unit.num)}
					<div class="container grid grid-cols-4 gap-0" transition:fade={{ duration: 600 }}>
						<div class="w-full rounded-sm border-b-2 border-r-2 border-primary-950 p-2">
							<UnitEmployee {unit} classes="" />
							<button
								class="btn rounded-lg bg-primary-900"
								onclick={() => openModal('unitPricing', unit.advertisedPrice, '', unit.size)}
								>Change all {unit.size.replace(/^0+/gm, '').replace(/x0/gm, 'x')} pricing</button
							>
						</div>
						{#if data.unitNotesForm}
							<UnitNotesForm
								data={data.unitNotesForm}
								{unit}
								classes="min-w-80 border-r-2 border-b-2 border-primary-950"
							/>
						{/if}
						{#if lease}
							{@const customer = customers?.find((customer) => customer.id === lease.customerId)}
							<div class="w-full min-w-80 border-b-2 border-r-2 border-primary-950 p-2">
								<LeaseEmployee {lease} classes="m-4" />
								<button
									class="btn rounded-lg bg-primary-900"
									onclick={() => openModal('lease', 0, lease.leaseId)}>End Lease</button
								>
							</div>
							{#if customer}
								<User user={customer} classes="w-full border-b-2 border-primary-950 " />
							{:else}
								<div class="w-full min-w-80 border-b-2 border-primary-950"></div>
							{/if}
						{:else}
							<div class="w-full border-b-2 border-r-2 border-primary-950"></div>
							<div class="w-full min-w-80 border-b-2 border-primary-950"></div>
						{/if}
					</div>
				{/each}
				<Pagination {pageNum} {size} array={filteredUnits(units)} label="units" />
			{/if}
		{/await}
	{/await}
{/await}
