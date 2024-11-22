<script lang='ts'>
   import type { Lease } from "@prisma/client";
   import type { PartialUser } from "$lib/server/partialTypes";
	import dayjs from "dayjs";
   interface Props {
      lease: Lease;
   }
   let { lease }:Props = $props()
</script>

<div class="card p-4">
   <span>Unit number: {lease.unitNum.replace(/^0+/gm, '')}</span>
   <span>Lease effective date {dayjs(lease.leaseEffectiveDate).format('M/D/YYYY')}</span>
   {#if lease.leaseEnded}
      <span>Lease end date: {dayjs(lease.leaseEnded).format('M/D/YYYY')}</span>
   {/if}
</div>