<script lang='ts'>
   import type { Lease } from "@prisma/client";
	import dayjs from "dayjs";
   interface Props {
      lease: Lease;
   }
   let { lease }:Props = $props()
</script>

<div class="card p-4">
   <p>Unit number: <a href="/units/{lease.unitNum}">{lease.unitNum.replace(/^0+/gm,'')}</a></p>
   <p>Lease effective date {dayjs(lease.leaseEffectiveDate).format('M/D/YYYY')}</p>
   {#if lease.leaseEnded}
      <p>Lease end date: {dayjs(lease.leaseEnded).format('M/D/YYYY')}</p>
      {:else}
      <p>Current Customer</p>
   {/if}
   <p>Lease price ${lease.price}</p>
   <p>lease EID: {lease.anvilEID}</p>
   <p>leaseID: <a href="/leases/{lease.leaseId}">{lease.leaseId}</a></p>
</div>