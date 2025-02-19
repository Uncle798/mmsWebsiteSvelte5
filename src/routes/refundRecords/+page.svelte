<script lang="ts">
	import RefundRecordEmployee from '$lib/displayComponents/RefundRecordEmployee.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import Search from '$lib/forms/Search.svelte';
	import dayjs from 'dayjs';
	import type { PageData } from './$types';
	import type { RefundRecord } from '@prisma/client';
	import DateSearch from '$lib/forms/DateSearch.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import Revenue from '$lib/displayComponents/Revenue.svelte';
	import Header from '$lib/Header.svelte';
	import Placeholder from '$lib/displayComponents/Placeholder.svelte';
	import Address from '$lib/displayComponents/Address.svelte';
	import { fade } from 'svelte/transition';
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
	console.log()
</script>

<Header title="All Refunds" />
{#await wrapper}
	loading {numberFormatter.format(data.refundCount)} refunds
	{#if data.years}
		or select year:
		{#each data.years as year}
			<a href="/refundRecords/year/{year}" class="btn">{year.toString()},</a>
		{/each}
	{/if}
		<Placeholder numCols={1} numRows={2} heightClass='h-10' />
		<Placeholder numCols={2} numRows={size} heightClass='h-44'/>
	{:then refunds}
	{#await data.customers}
		<Placeholder numCols={1} numRows={2} heightClass='h-10' />
		<Placeholder numCols={2} numRows={size} heightClass='h-44'/>
	{:then customers}
		{#await data.addresses}
			<Placeholder numCols={1} numRows={2} heightClass='h-10' />
			<Placeholder numCols={2} numRows={size} heightClass='h-44'/>
		{:then addresses}
			<div class="flex mx-2 border-b-2  border-primary-50 dark:border-primary-950 shadow-lg" transition:fade={{duration:600}}>
				<Search
					bind:search 
					searchType="Refund records" 
					data={data.searchForm} 
					classes='p-2 w-1/2'	
				/>
				<DateSearch 
					bind:endDate 
					bind:startDate 
					data={data.dateSearchForm} 
					{minDate} 
					{maxDate} 
					classes='p-2'	
				/>
			</div>
			<div class="flex border-b-2 border-primary-50 dark:border-primary-950 m-2 shadow-lg">
				<Revenue 
					label="Total refunds" 
					amount={totalRevenue(searchRefunds(dateSearchRefunds(refunds)))}
					classes='mr-2'	
				/>
				<Revenue 
					label="Refunds not deposits" 
					amount={refundsNotDeposits(searchRefunds(dateSearchRefunds(refunds)))}
					classes=''	
				/>

			</div>
			<div class="grid grid-cols-1 mx-2 gap-3 shadow-lg">
				{#each slicedRefunds(searchRefunds(dateSearchRefunds(refunds))) as refund (refund.refundNumber)}
				{@const customer = customers.find((customer) => customer.id === refund.customerId)}
					<div class="border rounded-lg border-primary-50 dark:border-primary-950 sm:grid sm:grid-cols-2">
						<RefundRecordEmployee refundRecord={refund} classes='px-2 pt-2 '/>
						{#if customer}
						{@const address = addresses.find((address) => address.userId === customer.id)}
							<div class="flex flex-col">
								<UserEmployee user={customer} classes='pt-2 pl-2 ' />
								{#if address}
									<Address {address} classes='pl-2'/>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
			<Pagination bind:size bind:pageNum label="refund records" array={searchRefunds(dateSearchRefunds(refunds))} />
		{/await}
	{/await}
{/await}
