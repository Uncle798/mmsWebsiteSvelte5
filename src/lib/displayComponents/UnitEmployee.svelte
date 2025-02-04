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
   <div class="text-right">Unit Number:</div>
   <div class="font-medium">{unit.num.replace(/^0+/gm,'')}</div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right">Size:</div>
   <div class="font-medium"> <a href="/units/size/{unit.size}">{unit.size.replace(/^0+/gm, '').replace(/x0/gm, 'x')}</a></div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right inset-2">Advertised Price: </div>
   <div class="font-medium">{currencyFormatter.format(unit.advertisedPrice)}</div>
   <HorizontalDivider classes='col-span-2'/>
   {#if unit.leasedPrice}
      <div class="text-right">Leased Price: </div>
      <div class="font-medium">{currencyFormatter.format(unit.leasedPrice)}</div>
      <HorizontalDivider classes='col-span-2'/>
   {/if}
   {#if unit.notes}
      <div class="text-right">Notes:</div>
      <div class="font-medium"> {unit.notes}</div>
      <HorizontalDivider classes='col-span-2'/>
   {/if}
</div>