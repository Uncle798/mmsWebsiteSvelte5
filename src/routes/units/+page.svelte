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
	import type { Readable } from 'svelte/store';
	import type { SourceSelected, Source } from 'sveltekit-sse';
	import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';
	import { MenuIcon } from 'lucide-svelte';
	import { humanUnitSize } from '$lib/utils/humanUnitSize';
	import { humanUnitNum } from '$lib/utils/humanUnitNum';

	let { data }: { data: PageData } = $props();
	let modalOpen = $state(false);
	let currentLeaseId = $state('');
	let modalReason = $state('');
	let currentSize = $state('');
	let currentOldPrice = $state(0);
	let connection: Source | undefined = $state();
	let csv: Readable<string> & SourceSelected | undefined = $state();
	let value: Readable<string> & SourceSelected | undefined = $state();
	let valueState: {
    	readonly current: string;
	} | undefined = $state();
	let csvState: {
    	readonly current: string;
	} | undefined = $state();
	$effect(() => {
		if(csvState && csvState?.current !== ''){
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
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}
		if(valueState && valueState.current === 'CSV ready'){
			setTimeout(() => {
				connection?.close();
				valueState = undefined;
			}, 1000);
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
		modalReason = modalType;
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
		label: humanUnitSize(size),
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
		{#if modalReason === 'endLease'}
			{#if data.leaseEndForm}
				<LeaseEndForm
					data={data.leaseEndForm}
					leaseId={currentLeaseId}
					employee={true}
					bind:leaseEndModalOpen={modalOpen}
				/>
			{/if}
		{:else if modalReason === 'changeAllPrice'}
			<UnitPricingForm
				data={data.unitPricingForm!}
				bind:unitPricingFormModalOpen={modalOpen}
				size={currentSize}
				oldPrice={currentOldPrice}
				classes='m-1 sm:m-2'
			/>
		{:else if modalReason === 'changeDeposit' && currentUnit}
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
								<Revenue label='Leased monthly revenue' amount={totalRevenue(leases)} classes=''/>
								<Revenue label='Open monthly advertised total' amount={openRevenue(openUnits(units, leases))} />
								<span>Open percentage: {Math.round((openUnits(units, leases).length*100)/units.length)}%</span>
							</div>
						{/snippet}
					</RevenueBar>
					<SearchDrawer
						modalOpen={searchDrawerOpen}
						height='h-[250px] sm:h-[180px]'
					>
						{#snippet content()}
							<div class="flex flex-col sm:flex-row gap-2">
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
										connection = source('/api/csv?allUnits=true');
										value = connection.select('message');
										valueState = fromStore(value);
										csv = connection.select('csv');
										csvState = fromStore(csv);
									}}
								/>
								{valueState?.current}
								</div>
						{/snippet}
					</SearchDrawer>
            	<div class="sm:m-2 m-1 sm:mt-20 mt-38 mb-8 sm:mb-8" in:fade={{duration:1600}} out:fade={{duration:0}}>
               	{#each slicedUnits(filteredUnits(searchedUnits(units))) as unit (unit.num)}
               	{@const lease = leases?.find((lease) => lease.unitNum === unit.num)}
						{@const unitNotesForm = data.unitNotesForms.find((formData) => formData.id === unit.num)}
							<div class="border-2 border-primary-50-950 rounded-lg grid grid-cols-1 sm:grid-cols-2 my-2 gap-2">
								<div class="relative">
									<UnitEmployee {unit} classes=''/>
									<Menu onSelect={(e) =>{
										switch (e.value) {
											case 'changeAllPrice':
												modalReason = e.value;
												currentSize = unit.size;
												currentOldPrice = unit.advertisedPrice;
												modalOpen = true
												break;
											case 'changeDeposit':
												modalReason = e.value;
												currentUnit = unit;
												modalOpen = true;
											default:
												break;
										}
									}}>
										<Menu.Trigger class='absolute top-1 left-1'><MenuIcon aria-label='Unit menu' class='preset-filled-primary-50-950 rounded-sm p-1 size-8' /></Menu.Trigger>
										<Portal>
											<Menu.Positioner>
												<Menu.Content>
													<Menu.Item value='changeAllPrice'>
														<Menu.ItemText>Change all {humanUnitSize(unit.size)} prices</Menu.ItemText>
													</Menu.Item>
													<Menu.Item value='changeDeposit'>
														<Menu.ItemText>Change the deposit for unit {humanUnitNum(unit.num)}</Menu.ItemText>
													</Menu.Item>
												</Menu.Content>
											</Menu.Positioner>
										</Portal>
									</Menu>
									{#if unitNotesForm}
										<UnitNotesForm data={unitNotesForm} {unit} classes='mx-2'/>
									{/if}
								</div>
								{#if lease}
								{@const customer = customers?.find((customer) => customer.id === lease.customerId)}
									<div class="grid grid-cols-1 sm:grid-cols-2 border rounded-lg border-primary-50-950 sm:flex-row m-2">
										<div class = relative>
											<LeaseEmployee {lease} classes=''/>
											<Menu onSelect={(e) => {
												modalReason = e.value;
												currentLeaseId = lease.leaseId;
												modalOpen = true;
											}}>
												<Menu.Trigger class='absolute top-1 left-1'><MenuIcon aria-label='Lease menu' class='preset-filled-primary-50-950 rounded-sm p-1 size-8' /></Menu.Trigger>
												<Portal>
													<Menu.Positioner>
														<Menu.Content>
															<Menu.Item value='endLease'>
																<Menu.ItemText>End lease</Menu.ItemText>
															</Menu.Item>
														</Menu.Content>
													</Menu.Positioner>
												</Portal>
											</Menu>
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