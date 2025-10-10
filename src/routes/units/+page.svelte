<script lang="ts">
	import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
	import Combobox from '$lib/formComponents/Combobox.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import Placeholder from '$lib/displayComponents/Placeholder.svelte';
	import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import type { PageData } from './$types';
	import LeaseEndForm from '$lib/forms/LeaseEndForm.svelte';
	import UnitNotesForm from '$lib/forms/UnitNotesForm.svelte';
	import UnitPricingForm from '$lib/forms/UnitPricingForm.svelte';
	import Header from '$lib/Header.svelte';
	import { fade } from 'svelte/transition';
	import type { Lease, Unit } from '@prisma/client';
	import Search from '$lib/forms/Search.svelte';
	import Address from '$lib/displayComponents/AddressEmployee.svelte';
	import Revenue from '$lib/displayComponents/Revenue.svelte'
	import { SearchIcon, PanelTopClose } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import SearchDrawer from '$lib/displayComponents/Modals/SearchDrawer.svelte';
	import FormModal from '$lib/displayComponents/Modals/FormModal.svelte';
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
	let selectedSize = $state(['']);
	let slicedUnits = $derived((units: Unit[]) => units.slice((pageNum - 1) * size, pageNum * size));
	let filteredUnits = $derived((units:Unit[]) => {
		if(selectedSize[0] === 'All'){
			return units
		} else if(selectedSize[0] !== ''){
			return units.filter((unit) => {
				return unit.size === selectedSize[0]
			})
		} else {
			return units
		}
	})
	const totalRevenue = $derived((leases:Lease[]) => {
		let totalRevenue = 0;
		leases.forEach((lease) => {
			totalRevenue += lease.price
		})
		return totalRevenue;
	})
	const searchedUnits = $derived((units:Unit[]) => 
		units.filter((unit) => {
			return unit.num.toString().toLowerCase().includes(search.toLowerCase())
		})
	)
	   interface ComboboxData {
      label: string;
      value: string;
   }
   const comboboxData:ComboboxData[] = $derived(data.sizes.map(size => ({
		label: size.replace(/^0+/gm, '').replace(/x0/gm, 'x'),
		value: size
	})))
	onMount(() => {
		comboboxData.unshift({label: 'All', value: 'all'})
	})
	let searchDrawerOpen = $state(false)
</script>

<Header title="All units" />
{#await data.units}
	<div class="mt-14 sm:mt-10 m-1 sm:m-2">
		Loading units...
		<Placeholder numCols={1} numRows={6} heightClass='h-96' classes='sm:hidden'/>
		<Placeholder numCols={1} numRows={6} heightClass='h-76' classes='hidden sm:block'/>
	</div>
{:then units} 
	{#await data.leases}
		<div class="mt-14 sm:mt-10 m-1 sm:m-2">
			Loading leases...
		</div>
		<Placeholder numCols={1} numRows={3} heightClass='h-96'/>
	{:then leases} 
		{#await data.customers}
			<div class="mt-14 sm:mt-10 m-1 sm:m-2">
				Loading customers...
			</div>
			<Placeholder numCols={1} numRows={3} heightClass='h-96'/>
			{:then customers}
			{#await data.addresses}
			<div class="mt-14 sm:mt-10 m-1 sm:m-2">
				Loading addresses...
			</div>
			<Placeholder numCols={1} numRows={3} heightClass='h-96'/>
			{:then addresses} 
            {#if units}
					<Revenue label='Current leased monthly revenue' amount={totalRevenue(leases)} classes='bg-tertiary-50-950 w-full rounded-b-lg fixed top-11 sm:top-8 z-40 p-1'/>
					<SearchDrawer
						modalOpen={searchDrawerOpen}
						height='h-[180]'
					>
						{#snippet content()}
							<div class="mx-2 mt-11">
								<Search searchType='Unit number' data={data.searchForm} classes='' bind:search={search}/>
								<Combobox 
									data={comboboxData} 
									label='Select Size' 
									placeholder='Select size...'
									onValueChange={(details) => {
										searchDrawerOpen=false;
										selectedSize=details.value
									}}
								/> 
								</div>
						{/snippet}
					</SearchDrawer>
            	<div class="sm:m-2 m-1 sm:mt-20 mt-22 mb-8" in:fade={{duration:1600}} out:fade={{duration:0}}>
               	{#each slicedUnits(filteredUnits(searchedUnits(units))) as unit}
               	{@const lease = leases?.find((lease) => lease.unitNum === unit.num)}
							<div class="border-2 border-primary-50-950 rounded-lg grid grid-cols-1 sm:grid-cols-2 my-2 gap-2">
								<div class="flex flex-col">
									<UnitEmployee {unit} classes=''/>
									<button class="btn preset-filled-primary-50-950 rounded-lg mx-2 mb-2" onclick={()=> openModal('unitPricing', unit.advertisedPrice, '', unit.size)}>Change all {unit.size.replace(/^0+/gm,'').replace(/x0/gm,'x')} pricing</button>
									{#if data.unitNotesForm}
										<UnitNotesForm data={data.unitNotesForm} {unit} classes='mx-1 sm:mx-2'/>
									{/if}
								</div>
								{#if lease}
								{@const customer = customers?.find((customer) => customer.id === lease.customerId)}
									<div class="flex flex-col border rounded-lg border-primary-50-950 sm:flex-row m-2">
										<div>
											<LeaseEmployee {lease} classes=''/>
											<button class="btn preset-filled-primary-50-950 rounded-lg m-1 sm:m-2 h-8" onclick={()=>openModal('lease', 0, lease.leaseId)}>End Lease</button>
										</div>
										<div class="flex flex-col">
											{#if customer}
											{@const address = addresses.find((address) => address.userId === customer.id)}
												<UserEmployee user={customer} classes='truncate mx-1 sm:mx-2'/>
												{#if address}
													<Address {address} classes='truncate mx-1 sm:mx-2' />
												{/if}
											{/if}
										</div>
									</div>

								{/if}
							</div>
						{/each}
					</div>
            	<Pagination bind:pageNum={pageNum} bind:size={size} array={filteredUnits(searchedUnits(units))} label='units'/>
					<FormModal
						modalOpen={modalOpen}
					>
						{#snippet content()}
							{#if globalModalType === 'lease'}
								{#if data.leaseEndForm}
									<LeaseEndForm
										data={data.leaseEndForm}
										leaseId={currentLeaseId}
										employee={true}
										bind:leaseEndModalOpen={modalOpen}
									/>
								{/if}
							{:else if globalModalType === 'unitPricing'}
								<UnitPricingForm
									data={data.unitPricingForm!}
									bind:unitPricingFormModalOpen={modalOpen}
									size={currentSize}
									oldPrice={currentOldPrice}
									classes='m-1 sm:m-2'
								/>
							{/if}
							<button class="btn" onclick={() => (modalOpen = false)}>Cancel</button>
						{/snippet}
					</FormModal>
            {/if}
			{/await}
		{/await}    
	{/await}
{/await}