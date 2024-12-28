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
   <p>Unit number: {lease.unitNum.replace(/^0+/gm, '')}</p>
   <p>Lease effective date {dayjs(lease.leaseEffectiveDate).format('M/D/YYYY')}</p>
   {#if lease.leaseEnded}
      <p>Lease end date: {dayjs(lease.leaseEnded).format('M/D/YYYY')}</p>
      {:else}
      <p><a href="/autopay?leaseId={lease.leaseId}">Sign up for autopay through Stripe</a></p>
   {/if}
</div>