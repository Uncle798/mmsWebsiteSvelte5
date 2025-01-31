<script lang='ts'>
   import type { Lease } from "@prisma/client";
	import dayjs from "dayjs";
   interface Props {
      lease: Lease;
   }
   let { lease }:Props = $props();
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
</script>

<div class="m-4 w-1/3 flex-none">
   <p>Unit number: <a href="/units/{lease.unitNum}">{lease.unitNum.replace(/^0+/gm,'')}</a></p>
   <p>Lease effective date {dayjs(lease.leaseEffectiveDate).format('M/D/YYYY')}</p>
   {#if lease.leaseEnded}
      <p>Lease end date: {dayjs(lease.leaseEnded).format('M/D/YYYY')}</p>
      {:else}
      <p>Current Customer</p>
   {/if}
   <p>Lease price: {currencyFormatter.format(lease.price)}</p>
   <p>lease EID: {lease.anvilEID}</p>
   <p>leaseID: <a href="/leases/{lease.leaseId}">{lease.leaseId}</a></p>
</div>