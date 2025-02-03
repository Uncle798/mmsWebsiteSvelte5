<script lang="ts">
	import type { RefundRecord } from '@prisma/client';
	import dayjs from 'dayjs';

	interface Props {
		refundRecord: RefundRecord;
		classes?: string;
	}
	let { refundRecord, classes }: Props = $props();
	const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
</script>

<div class="m-4 w-1/3 min-w-[33.33%] {classes}">
	<p>
		Refund record number: <a href="/refundRecords/{refundRecord.refundNumber}"
			><strong>{refundRecord.refundNumber}</strong></a
		>
	</p>
	<p>
		Refund amount:

		<span class="inline-flex rounded-full bg-cyan-500 px-2 py-1 text-xs">
			{currencyFormatter.format(refundRecord.refundAmount)}
		</span>
	</p>
	{#if refundRecord.refundCompleted}
		<p>Refund completed: {dayjs(refundRecord.refundCompleted).format('M/D/YYYY')}</p>
	{:else}
		<p>Refund not completed</p>
	{/if}
	<p>
		Refund type: {refundRecord.refundType.replace(
			/\w\S*/g,
			(text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
		)}
	</p>
	<div class="flex">
		<span class="text-nowrap">Refund notes:</span>

		<p>
			{#if refundRecord.paymentRecordNum}
				<a href="/paymentRecords/{refundRecord.paymentRecordNum}">{refundRecord.refundNotes}</a>
			{:else}
				{refundRecord.refundNotes}
			{/if}
		</p>
	</div>
</div>
