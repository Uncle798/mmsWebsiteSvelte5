<script lang='ts'>
   import type { Lease } from "../../generated/prisma/browser";
   import { currencyFormatter } from "$lib/utils/currencyFormatter";
	import dayjs from "dayjs";
	import HorizontalDivider from "./HorizontalDivider.svelte";
   import { Collapsible } from "@skeletonlabs/skeleton-svelte";
	import { humanUnitNum } from "$lib/utils/humanUnitNum";
   interface Props {
      lease: Lease;
      open?: boolean;
      classes?: string;
   }
   let { lease, classes, open = $bindable()}:Props = $props();
</script>
<Collapsible {open} onOpenChange={(d) => open = d.open}>
   <Collapsible.Trigger class='{classes} grid grid-cols-2 gap-x-2 w-87 sm:w-110'>
      <div class="col-span-2 text-center text-sm font-semibold">Lease</div>
      <div class="text-right">Unit number</div>
      <div class="font-medium"><a href="/units/{lease.unitNum}" class="anchor">{humanUnitNum(lease.unitNum)}</a></div>
      <HorizontalDivider classes="col-span-2"/>
   </Collapsible.Trigger>
   <Collapsible.Content class='{classes} grid grid-cols-2 gap-x-2 w-87 sm:w-110'>
      <div class="text-right -indent-2">Effective date</div>
      <div class="font-medium">{dayjs(lease.leaseEffectiveDate).format('M/D/YYYY')}</div>
      <HorizontalDivider classes="col-span-2"/>
      <div class="text-right">Price</div>
      <div class="font-medium">{currencyFormatter(lease.price)}</div>
      <HorizontalDivider classes="col-span-2"/>
      {#if lease.depositAmount}
         <div class="text-right">Deposit</div>
         <div class="font-medium">{currencyFormatter(lease.depositAmount)}</div>
         <HorizontalDivider classes="col-span-2"/>
      {/if}
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
   </Collapsible.Content>
</Collapsible>