<script lang="ts">
	import { humanUnitNum } from "$lib/utils/humanUnitNum";
	import { humanUnitSize } from "$lib/utils/humanUnitSize";
   import { currencyFormatter } from "$lib/utils/currencyFormatter";
   import type { Unit } from "../../generated/prisma/browser";
	import HorizontalDivider from './HorizontalDivider.svelte';
   interface Props {
      unit: Unit,
      classes?: string;
   }
   let { unit, classes }:Props = $props();
</script>

<div class="grid grid-cols-2 gap-x-2 {classes}">
   <div class="col-span-2 text-center text-sm font-semibold">Unit</div>
   <div class="text-right">Number</div>
   <div class="font-medium"><a class="anchor" href="/units/{unit.num}">{humanUnitNum(unit.num)}</a></div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right">Size</div>
   <div class="font-medium"> <a class="anchor" href="/units/size/{unit.size}">{humanUnitSize(unit.size)}</a></div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right">Advertised Price</div>
   <div class="font-medium">{currencyFormatter(unit.advertisedPrice)}</div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right">Deposit</div>
   <div>{currencyFormatter(unit.deposit)}</div>
   {#if unit.leasedPrice}
      <HorizontalDivider classes='col-span-2'/>
      <div class="text-right">Leased Price</div>
      <div class="font-medium">{currencyFormatter(unit.leasedPrice)}</div>
   {/if}
   {#if unit.notes}
   <HorizontalDivider classes='col-span-2'/>
      <div class="text-right">Notes:</div>
      <div class="font-medium"> {unit.notes}</div>
   {/if}
</div>