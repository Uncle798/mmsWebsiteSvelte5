<script lang="ts">
   import type { RefundRecord } from "@prisma/client";
   import dayjs from "dayjs";

   interface Props {
      refundRecord: RefundRecord;
   }
   let { refundRecord }:Props = $props();
</script>

<div class="card p-4">
   <p>Refund record number: <a href="/refundRecords/{refundRecord.refundNumber}">{refundRecord.refundNumber}</a></p>
   <p>${refundRecord.refundAmount}</p>
   {#if refundRecord.refundCompleted}
      <p>Refund completed: {dayjs(refundRecord.refundCompleted).format('M/D/YYYY')}</p>
      {:else}
      <p>Refund not completed</p>
   {/if}
   <p>Refund type: {refundRecord.refundType.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())}</p>
   {#if refundRecord.paymentRecordNum}
      <p>Refund notes: <a href="/paymentRecords/{refundRecord.paymentRecordNum}">{refundRecord.refundNotes}</a></p>
   {:else}
      <p>Refund notes: {refundRecord.refundNotes}</p>
   {/if}
</div>