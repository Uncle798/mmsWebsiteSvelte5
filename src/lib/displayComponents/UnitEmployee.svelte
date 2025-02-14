<script lang="ts">
   import type { Unit, Lease } from '@prisma/client';
	import HorizontalDivider from './HorizontalDivider.svelte';
   interface Props {
      unit: Unit,
      classes?: string;
   }
   let { unit, classes }:Props = $props();
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
</script>

<div class="grid grid-cols-2 gap-x-2 {classes}">
   <div class="col-span-2 text-center text-sm font-semibold">Unit</div>
   <div class="text-right">Number</div>
   <div class="font-medium"><a class="anchor" href="/units/{unit.num}">{unit.num.replace(/^0+/gm,'')}</a></div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right">Size</div>
   <div class="font-medium"> <a class="anchor" href="/units/size/{unit.size}">{unit.size.replace(/^0+/gm, '').replace(/x0/gm, 'x')}</a></div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right">Advertised Price</div>
   <div class="font-medium">{currencyFormatter.format(unit.advertisedPrice)}</div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right">Deposit</div>
   <div>{currencyFormatter.format(unit.deposit)}</div>
   <HorizontalDivider classes='col-span-2'/>
   {#if unit.leasedPrice}
      <div class="text-right">Leased Price</div>
      <div class="font-medium">{currencyFormatter.format(unit.leasedPrice)}</div>
   {/if}
   {#if unit.notes}
   <HorizontalDivider classes='col-span-2'/>
      <div class="text-right">Notes:</div>
      <div class="font-medium"> {unit.notes}</div>
   {/if}
</div>