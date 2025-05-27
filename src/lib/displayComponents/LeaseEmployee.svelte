<script lang='ts'>
   import type { Lease } from "@prisma/client";
	import dayjs from "dayjs";
	import HorizontalDivider from "./HorizontalDivider.svelte";
   interface Props {
      lease: Lease;
      classes?: string;
   }
   let { lease, classes }:Props = $props();
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
</script>

<div class=" {classes} grid grid-cols-2 gap-x-2">
   <div class="col-span-2 text-center text-sm font-semibold">Lease</div>
   <div class="text-right">Unit number</div>
   <div class="font-medium"><a href="/units/{lease.unitNum}" class="anchor">{lease.unitNum.replace(/^0+/gm,'')}</a></div>
   <HorizontalDivider classes="col-span-2"/>
   <div class="text-right -indent-2">Effective date</div>
   <div class="font-medium">{dayjs(lease.leaseEffectiveDate).format('M/D/YYYY')}</div>
   <HorizontalDivider classes="col-span-2"/>
   <div class="text-right">Price</div>
   <div class="font-medium">{currencyFormatter.format(lease.price)}</div>
   <HorizontalDivider classes="col-span-2"/>
   {#if lease.leaseEnded}
      <div class="text-right">End date</div>
      <div class="font-medium"> {dayjs(lease.leaseEnded).format('M/D/YYYY')}</div>
      <HorizontalDivider classes="col-span-2"/>
   {:else}
      <div class="font-medium col-span-2 text-center">Current Customer</div>
      <HorizontalDivider classes="col-span-2"/>
   {/if}

   <div class="text-right">lease EID</div>
   <div class="truncate font-medium">{lease.anvilEID}</div>
   <HorizontalDivider classes="col-span-2"/>
   <div class="text-right">leaseID</div>
   <div class="truncate font-medium"><a href="/leases/{lease.leaseId}" class="anchor">{lease.leaseId}</a></div>
   {#if lease.subscriptionId}
      On auto-pay
   {:else}
      <a href="/autopay?leaseId={lease.leaseId}" class="anchor">Sign up for Auto-pay</a>
   {/if}
</div>