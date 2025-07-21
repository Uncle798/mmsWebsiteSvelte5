<script lang="ts">
	import RefundRecordEmployee from '$lib/displayComponents/RefundRecordEmployee.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import Search from '$lib/forms/Search.svelte';
	import dayjs from 'dayjs';
	import type { PageData } from './$types';
	import type { RefundRecord, User } from '@prisma/client';
	import DateSearch from '$lib/forms/DateSearch.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import Revenue from '$lib/displayComponents/Revenue.svelte';
	import Header from '$lib/Header.svelte';
	import Placeholder from '$lib/displayComponents/Placeholder.svelte';
	import Address from '$lib/displayComponents/AddressEmployee.svelte';
	import { fade } from 'svelte/transition';
	import { Combobox, Modal } from '@skeletonlabs/skeleton-svelte';
	import EmailCustomer from '$lib/emailCustomer.svelte';
	import { SearchIcon, PanelTopClose } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	let { data }: { data: PageData } = $props();
	let size = $state(25);
	let pageNum = $state(1);
	let search = $state('');
	let startDate = $state<Date>(new Date());
	let endDate = $state<Date>(new Date());
	let maxDate = $state<Date>();
	let minDate = $state<Date>();
	let wrapper = new Promise<RefundRecord[]>(async (res) => {
		const refunds = await data.refunds;
		startDate = dayjs(refunds[refunds.length-1].refundCreated).startOf('year').toDate();
		minDate = startDate;
		maxDate = new Date();
		endDate = maxDate;
		res(refunds);
	});
	const numberFormatter = new Intl.NumberFormat('en-US');
	let slicedRefunds = $derived((refunds: RefundRecord[]) =>
		refunds.slice((pageNum - 1) * size, pageNum * size)
	);
	let searchRefunds = $derived((refunds: RefundRecord[]) =>
		refunds.filter((refund) => refund.refundNumber.toString().includes(search))
	);
	let dateSearchRefunds = $derived((refunds: RefundRecord[]) =>
		refunds.filter((refund) => {
			if (!startDate || !endDate) {
				return refund;
			}
			return refund.refundCreated >= startDate && refund.refundCreated <= endDate;
		})
	);
	let totalRevenue = $derived((refunds: RefundRecord[]) => {
		let totalRevenue: number = 0;
		refunds.forEach((refund) => {
			totalRevenue += refund.refundAmount;
		});
		return totalRevenue;
	});
	const refundsNotDeposits = $derived((refunds: RefundRecord[]) => {
		let totalRevenue: number = 0;
		refunds.forEach((refund) => {
			if(!refund.deposit)
			totalRevenue += refund.refundAmount;
		});
		return totalRevenue;
	});
	let nameSearch = $state('')
	const currentUsers = $derived((users:User[]) => users.filter((user) => {
		return user.givenName?.toLowerCase().includes(nameSearch.toLowerCase()) 
		|| user.familyName?.toLowerCase().includes(nameSearch.toLowerCase()) 
		|| user.organizationName?.toLowerCase().includes(nameSearch.toLowerCase())
	}))
	const searchByUser = $derived((refunds:RefundRecord[], customers:User[]) => {
		const returnedRefunds:RefundRecord[] =[]
		for(const user of customers){
			const userRefunds = refunds.filter((record) => {
				return record.customerId === user.id
			});
			userRefunds.forEach((record) => {
				returnedRefunds.push(record);
			})
		};
		return returnedRefunds;
	})
	let searchDrawerOpen = $state(false);
	interface ComboboxData {
      label: string;
      value: string;
   }
   let yearComboboxData:ComboboxData[] = []
   for(const year of data.years){
      yearComboboxData.push({label:year.toString(), value:year.toString()})
   }
</script>

<Header title="All Refunds" />
{#await wrapper}
	<div class="mt-14 sm:mt-10">
		Loading {numberFormatter.format(data.refundCount)} refunds...
		{#if data.years}
			<Combobox
				data={yearComboboxData}
				label='Select year'
				placeholder='Select year...'
				openOnClick={true}
				onValueChange={(details) => {
					goto(`/refundRecords/year/${details.value[0]}`)
				}}
				zIndex='50'
			/>
		{/if}
	</div>
		<Placeholder numCols={2} numRows={size} heightClass='h-44'/>
	{:then refunds}
	{#await data.customers}
		<div class="mt-14 sm:mt-10">
			Loading customers...
		</div>
		<Placeholder numCols={2} numRows={size} heightClass='h-44'/>
	{:then customers}
		{#await data.addresses}
			<div class="mt-14 sm:mt-10">
				Loading addresses...
			</div>
			<Placeholder numCols={2} numRows={size} heightClass='h-44'/>
		{:then addresses}
				<Modal
			open={searchDrawerOpen}
			onOpenChange={(event)=>(searchDrawerOpen = event.open)}
			triggerBase='btn preset-filled-primary-50-950 rounded-lg fixed top-0 right-0 z-50 h-12 sm:h-auto'
			contentBase='bg-surface-100-900 h-[400px] w-screen rounded-lg'
			positionerJustify=''
			positionerAlign=''
			positionerPadding=''
			transitionsPositionerIn={{y:-400, duration: 600}}
			transitionsPositionerOut={{y:-400, duration: 600}}
			modal={false}
		>
			{#snippet trigger()}
				<SearchIcon aria-label='Search' />
			{/snippet}
			{#snippet content()}
				<button onclick={()=>searchDrawerOpen=false} class='btn preset-filled-primary-50-950 rounded-lg m-1 absolute top-0 right-0'><PanelTopClose aria-label='Close'/></button>
				<Search
					bind:search={search}
					searchType="refund records" 
					data={data.searchForm} 
					classes='p-2 '	
				/>
				<Search
					bind:search={nameSearch} 
					searchType="user name" 
					data={data.searchForm} 
					classes='p-2 '	
				/>
				<DateSearch 
					bind:endDate 
					bind:startDate 
					data={data.dateSearchForm} 
					{minDate} 
					{maxDate} 
					classes='p-2'	
				/>
			{/snippet}
		</Modal>
		<div class=" bg-tertiary-50-950 w-full rounded-b-lg fixed top-12 sm:top-9 left-0 flex flex-col sm:flex-row z-50">
			<Revenue 
				label="Total refunds" 
				amount={totalRevenue(searchRefunds(dateSearchRefunds(refunds)))}
				classes=''	
			/>
			<Revenue 
				label="Refunds not deposits" 
				amount={refundsNotDeposits(searchRefunds(dateSearchRefunds(refunds)))}
				classes=''	
			/>
		</div>
			<div class="grid grid-cols-1 mx-2 mt-26 sm:mt-18 gap-3 shadow-lg" in:fade={{duration:600}}>
				{#each slicedRefunds(searchRefunds(dateSearchRefunds(searchByUser(refunds, currentUsers(customers))))) as refund (refund.refundNumber)}
				{@const customer = customers.find((customer) => customer.id === refund.customerId)}
					<div class="border rounded-lg border-primary-50-950 sm:grid sm:grid-cols-2">
						<RefundRecordEmployee refundRecord={refund} classes='mx-2 mt-2 '/>
						{#if customer}
						{@const address = addresses.find((address) => address.userId === customer.id)}
							<div class="flex flex-col">
								<UserEmployee user={customer} classes='mx-2 ' />
								{#if address}
									<Address {address} classes='mx-2'/>
								{/if}
								{#if customer.email && customer.emailVerified}
									<EmailCustomer
										emailAddress={customer.email}
										recordNum={refund.refundNumber}
										apiEndPoint='/api/sendRefund'
										buttonText='Send Refund email'
										classes='mx-2'
									/>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
			<Pagination bind:size bind:pageNum label="refund records" array={searchRefunds(dateSearchRefunds(searchByUser(refunds, currentUsers(customers))))} />
		{/await}
	{/await}
{/await}
