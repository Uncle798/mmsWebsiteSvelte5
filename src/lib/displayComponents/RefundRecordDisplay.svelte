<script lang="ts">
	import type { RefundRecord } from '@prisma/client';
	import dayjs from 'dayjs';
	import HorizontalDivider from './HorizontalDivider.svelte';

	interface Props {
		refundRecord: RefundRecord;
		classes?: string;
	}
	let { refundRecord, classes }: Props = $props();
	const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
</script>

<div class="p-4 grid grid-cols-2 {classes}">
	<div>Refund record number:</div>
	<div class="font-medium"><a href="/refundRecords/{refundRecord.refundNumber}">{refundRecord.refundNumber}</a></div>
	<HorizontalDivider classes='col-span-2' />
	<div>Refund amount: </div>
	<div class="font-medium">{currencyFormatter.format(refundRecord.refundAmount)}</div>
	<HorizontalDivider classes='col-span-2' />
	{#if refundRecord.refundCompleted}
		<div>Refund completed:</div>
		<div class="font-medium">{dayjs(refundRecord.refundCompleted).format('M/D/YYYY')}</div>
	{:else}
		<div class="col-span-2 text-center font-medium">Refund not completed</div>
	{/if}
	<HorizontalDivider classes='col-span-2' />
	<div>Refund type:</div>
	<div class="font-medium">{refundRecord.refundType.replace(/\w\S*/g,(text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())}</div>
	<HorizontalDivider classes='col-span-2' />
	<div class="">Refund notes:</div>
	{#if refundRecord.paymentRecordNum}
		<div class="text-left pl-4 pr-2 -indent-4 font-medium"><a href="/paymentRecords/{refundRecord.paymentRecordNum}">{refundRecord.refundNotes}</a></div>
	{:else}
		<div class="text-left pl-4 pr-2 -indent-4 font-medium">{refundRecord.refundNotes}</div>
	{/if}
</div>
