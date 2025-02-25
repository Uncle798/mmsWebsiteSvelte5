<script lang='ts'>
   import type { Lease } from "@prisma/client";
	import dayjs from "dayjs";
	import HorizontalDivider from "../HorizontalDivider.svelte";
   interface Props {
      lease: Lease;
      classes?: string;
   }
   let { lease, classes }:Props = $props();
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
</script>

<div class="{classes} grid grid-cols-2 gap-x-2 items-start">
   <div class="col-span-2 text-center text-sm font-semibold">Lease</div>
   <div class="text-right">Unit number:</div>
   <div class="font-medium"><a href="/leases/{lease.leaseId}" class="anchor">{lease.unitNum.replace(/^0+/gm,'')}</a></div>
   <HorizontalDivider classes="col-span-2"/>
   <div class="text-right -indent-2">Effective date:</div>
   <div class="font-medium">{dayjs(lease.leaseEffectiveDate).format('M/D/YYYY')}</div>
   <HorizontalDivider classes="col-span-2"/>
   <div class="text-right">Price:</div>
   <div class="font-medium">{currencyFormatter.format(lease.price)}</div>
   <HorizontalDivider classes="col-span-2"/>
   {#if lease.leaseEnded}
      <div class="text-right">Lease end date:</div>
      <div class="font-medium"> {dayjs(lease.leaseEnded).format('M/D/YYYY')}</div>
      <HorizontalDivider classes="col-span-2"/>
   {/if}
</div>