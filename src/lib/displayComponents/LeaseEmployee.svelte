<script lang='ts'>
   import type { Lease } from "@prisma/client";
	import dayjs from "dayjs";
   interface Props {
      lease: Lease;
   }
   let { lease }:Props = $props()
</script>

<div class="card p-4">
   <p>Unit number: {lease.unitNum.replace(/^0+/gm,'')}</p>
   <p>Lease effective date {dayjs(lease.leaseEffectiveDate).format('M/D/YYYY')}</p>
   {#if lease.leaseEnded}
      <p>Lease end date: {dayjs(lease.leaseEnded).format('M/D/YYYY')}</p>
   {/if}
   {#if lease.price}
   <p>Lease price ${lease.price}</p>
   {:else}
   <p>Not leased currently </p>
   {/if}
</div>