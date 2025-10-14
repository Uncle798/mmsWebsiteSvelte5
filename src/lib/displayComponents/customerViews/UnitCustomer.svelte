<script lang="ts">
   import type { Unit } from '@prisma/client';
	import HorizontalDivider from '../HorizontalDivider.svelte';
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
   <div class="font-medium">{unit.num.replace(/^0+/gm,'')}</div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right">Size</div>
   <div class="font-medium">{unit.size.replace(/^0+/gm, '').replace(/x0/gm, 'x')}</div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right">Price</div>
   <div class="font-medium">{currencyFormatter.format(unit.advertisedPrice)}</div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right">Deposit</div>
   <div>{currencyFormatter.format(unit.deposit)}</div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right col-start-1">Description</div>
   <div class="font-medium text-left text-wrap pr-0.5">{unit.description}</div>
   
</div>