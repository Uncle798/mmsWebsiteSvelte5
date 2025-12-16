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
	import type { Lease, Unit } from '../../generated/prisma/browser';
	import Search from '$lib/forms/Search.svelte';
	import Address from '$lib/displayComponents/AddressEmployee.svelte';
	import Revenue from '$lib/displayComponents/Revenue.svelte'
	import { onMount } from 'svelte';
	import { fromStore } from 'svelte/store';
	import SearchDrawer from '$lib/displayComponents/Modals/SearchDrawer.svelte';
	import FormModal from '$lib/displayComponents/Modals/FormModal.svelte';
	import RevenueBar from '$lib/displayComponents/RevenueBar.svelte';
	import { PUBLIC_COMPANY_NAME } from '$env/static/public';
	import dayjs from 'dayjs';
	import Button from '$lib/core/Button.svelte';
	import ChangeDepositForm from '$lib/forms/ChangeDepositForm.svelte';
	import { source } from 'sveltekit-sse';
	
	let { data }: { data: PageData } = $props();
	let modalOpen = $state(false);
	let currentLeaseId = $state('');
	let globalModalType = $state('');
	let currentSize = $state('');
	let currentOldPrice = $state(0);
	const connection = source('/api/csv');
	const value = connection.select('message');
	const valueState = $state(fromStore(value));
	const csv = connection.select('csv');
	const csvState = $state(fromStore(csv));
	$effect(() => {
		if(csvState.current !== ''){
			const transformed = csv.transform(function run(data) {
				console.log(data);
			})
		}
	})
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
		if(selectedSize[0] === 'all'){
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
	});
	const openUnits = $derived((units:Unit[], leases:Lease[]) => {
		const returnedUnits:Unit[] = [];
		for(const unit of units){
			const lease = leases.find((lease) => lease.unitNum === unit.num);
			if(lease === undefined){
				returnedUnits.push(unit);
			}
		}
		return returnedUnits;
	});
	const openRevenue = $derived((units:Unit[]) => {
		let total = 0;
		for(const unit of units){
			total += unit.advertisedPrice
		}
		return total;
	});
	const searchedUnits = $derived((units:Unit[]) => 
		units.filter((unit) => {
			return unit.num.toString().toLowerCase().includes(search.toLowerCase())
		})
	);
	interface ComboboxData {
      label: string;
      value: string;
   }
   const comboboxData:ComboboxData[] = $derived(data.sizes.map(size => ({
		label: size.replace(/^0+/gm, '').replace(/x0/gm, 'x'),
		value: size
	})))
	onMount(() => {
		comboboxData.unshift({label: 'All', value: 'all'});
	})
	let searchDrawerOpen = $state(false);
	let currentUnit = $state<Unit>();
</script>

<Header title="All units" />
<FormModal
	bind:modalOpen={modalOpen}
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
		{:else if globalModalType === 'changeDeposit' && currentUnit}
			<ChangeDepositForm
				data={data.changeDepositForm}
				unit={currentUnit}
			/>
		{/if}
	{/snippet}
</FormModal>
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
					<RevenueBar>
						{#snippet content()}
							<div class="mx-2 flex flex-row gap-0.5">
								<Revenue label='Current leased monthly revenue' amount={totalRevenue(leases)} classes=''/>
								<Revenue label='Currently open monthly advertised total' amount={openRevenue(openUnits(units, leases))} />
								<span>Open percentage: {Math.round((openUnits(units, leases).length*100)/units.length)}%</span>
							</div>
						{/snippet}
					</RevenueBar>
					<SearchDrawer
						modalOpen={searchDrawerOpen}
						height='h-[180px]'
					>
						{#snippet content()}
							<div class="mx-2 flex gap-2">
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
								<Button
									label='Download CSV of all units.'
									type='button'
									onClick={() => {
										
										if(csvState.current !== ''){
											const blob = new Blob([csvState.current], {
												type: 'application/csv'
											});
											const url = URL.createObjectURL(blob);
											const filename = `${PUBLIC_COMPANY_NAME} units report ${dayjs().format('MMMM D YYYY')}.csv`
											const a = document.createElement('a');
											a.download = filename;
											a.href = url;
											document.body.append(a);
											a.click();
											document.removeChild(a);
											URL.revokeObjectURL(url);
										}
									}}
								/>
								{valueState.current}
								</div>
						{/snippet}
					</SearchDrawer>
            	<div class="sm:m-2 m-1 sm:mt-20 mt-22 mb-8 sm:mb-8" in:fade={{duration:1600}} out:fade={{duration:0}}>
               	{#each slicedUnits(filteredUnits(searchedUnits(units))) as unit (unit.num)}
               	{@const lease = leases?.find((lease) => lease.unitNum === unit.num)}
						{@const unitNotesForm = data.unitNotesForms.find((formData) => formData.id === unit.num)}
						{@const humanUnitNum = unit.num.replace(/^0+/gm, '')}
						{@const humanUnitSize = unit.size.replace(/^0+/gm,'').replace(/x0/gm,'x')}
							<div class="border-2 border-primary-50-950 rounded-lg grid grid-cols-1 sm:grid-cols-2 my-2 gap-2">
								<div class="flex flex-col">
									<UnitEmployee {unit} classes=''/>
									<div class="mx-2 flex flex-col gap-2">
										<Button
											label="Change all {humanUnitSize} pricing"
											type='button'
											onClick={() => {
												openModal('unitPricing', unit.advertisedPrice, '', unit.size);
											}}
										/>
										<Button
											label="Change all the deposit for unit {humanUnitNum}"
											type='button'
											onClick={() => {
												currentUnit = unit;
												globalModalType = 'changeDeposit'
												modalOpen = true;
											}}
										/>
									</div>
									
									{#if unitNotesForm}
										<UnitNotesForm data={unitNotesForm} {unit} classes='mx-1 sm:mx-2'/>
									{/if}
								</div>
								{#if lease}
								{@const customer = customers?.find((customer) => customer.id === lease.customerId)}
									<div class="grid grid-cols-2 border rounded-lg border-primary-50-950 sm:flex-row m-2">
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
						<Pagination bind:pageNum={pageNum} bind:size={size} array={filteredUnits(searchedUnits(units))} label='units'/>
					</div>
            {/if}
			{/await}
		{/await}    
	{/await}
{/await}