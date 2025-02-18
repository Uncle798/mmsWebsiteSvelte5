<script lang="ts">
   import type { Unit, Lease } from '@prisma/client';
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
   <div class="font-medium"> <a href="/units/size/{unit.size}">{unit.size.replace(/^0+/gm, '').replace(/x0/gm, 'x')}</a></div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right">Price</div>
   <div class="font-medium">{currencyFormatter.format(unit.advertisedPrice)}</div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right">Deposit</div>
   <div>{currencyFormatter.format(unit.deposit)}</div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right text-wrap">Approximate Amount of Stuff</div>
   <div>{unit.description}</div>
</div>