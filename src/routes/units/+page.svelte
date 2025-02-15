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
	import type { Lease, Unit } from '@prisma/client';
	import Search from '$lib/forms/Search.svelte';
	import Address from '$lib/displayComponents/Address.svelte';
	import HorizontalDivider from '$lib/displayComponents/HorizontalDivider.svelte';
	import Revenue from '$lib/displayComponents/Revenue.svelte';
	let { data }: { data: PageData } = $props();
	let modalOpen = $state(false);
	let currentLeaseId = $state('');
	let globalModalType = $state('');
	let currentSize = $state('');
	let currentOldPrice = $state(0);
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
	const totalRevenue = $derived((leases:Lease[]) => {
		let totalRevenue = 0;
		leases.forEach((lease) => {
			totalRevenue += lease.price
		})
		return totalRevenue;
	})
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
   Loading units...
   <Placeholder numCols={2} numRows={3} heightClass='h-32'/>
{:then units} 
	{#await data.leases}
		loading leases
		<Placeholder numCols={2} numRows={3} heightClass='h-32'/>
	{:then leases} 
		{#await data.customers}
			loading customers 
			<Placeholder numCols={2} numRows={3} heightClass='h-32'/>
		{:then customers}
			{#await data.addresses}
				loading addresses
			{:then addresses} 
            {#if units}
					<Search {search} searchType='Unit number' data={data.searchForm} />
					<HorizontalDivider />
					<Revenue label='Current leased monthly revenue' amount={totalRevenue(leases)} />
					<HorizontalDivider />
            	<div class="grid container grid-cols-4 p-2 gap-y-3 gap-x-1" transition:fade={{duration:600}}>
               	{#each slicedUnits(filteredUnits(units)) as unit (unit.num)}
               	{@const lease = leases?.find((lease) => lease.unitNum === unit.num)}
							<div class=" rounded-lg border border-primary-50 dark:border-primary-950  flex flex-col">
								<UnitEmployee {unit} classes='p-4'/>
								<button class="btn preset-filled-primary-50-950 rounded-lg mx-2 mb-2" onclick={()=> openModal('unitPricing', unit.advertisedPrice, '', unit.size)}>Change all {unit.size.replace(/^0+/gm,'').replace(/x0/gm,'x')} pricing</button>
							</div>
							{#if data.unitNotesForm}
								<UnitNotesForm data={data.unitNotesForm} {unit} classes=' rounded-lg border border-primary-50 dark:border-primary-950 p-4 '/>
							{/if}
							{#if lease}
							{@const customer = customers?.find((customer) => customer.id === lease.customerId)}
								<div class=" flex flex-col rounded-lg border border-primary-50 dark:border-primary-950">
									<LeaseEmployee {lease} classes=''/>
									<button class="btn preset-filled-primary-50-950 rounded-lg m-4" onclick={()=>openModal('lease', 0, lease.leaseId)}>End Lease</button>
								</div>
								<div class="flex flex-col  rounded-lg border border-primary-50 dark:border-primary-950">
									{#if customer}
									{@const address = addresses.find((address) => address.userId === customer.id)}
										<User user={customer} classes='px-4 pt-4'/>
										{#if address}
											<Address {address} classes='px-4' />
										{/if}
									{/if}
								</div>
							{:else}
								<div class="rounded-lg border border-primary-50 dark:border-primary-950 "></div>
								<div class="rounded-lg border border-primary-50 dark:border-primary-950 "></div>
							{/if}
						{/each}
					</div>
            	<Pagination pageNum={pageNum} size={size} array={filteredUnits(units)} label='units'/>
            {/if}
			{/await}
		{/await}    
	{/await}
{/await}