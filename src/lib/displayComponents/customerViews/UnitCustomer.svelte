<script lang="ts">
   import type { Unit } from '../../../generated/prisma/browser';
   import { currencyFormatter } from "$lib/utils/currencyFormatter";
	import HorizontalDivider from '../HorizontalDivider.svelte';
	import { humanUnitNum } from '$lib/utils/humanUnitNum';
	import { humanUnitSize } from '$lib/utils/humanUnitSize';
   interface Props {
      unit: Unit,
      classes?: string;
   }
   let { unit, classes }:Props = $props();
</script>

<div class="grid grid-cols-2 gap-x-2 {classes}">
   <div class="col-span-2 text-center text-sm font-semibold">Unit</div>
   <div class="text-right">Number</div>
   <div class="font-medium">{humanUnitNum(unit.num)}</div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right">Size</div>
   <div class="font-medium">{humanUnitSize(unit.size)}</div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right">Price</div>
   <div class="font-medium">{currencyFormatter(unit.advertisedPrice)}</div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right">Deposit</div>
   <div>{currencyFormatter(unit.deposit)}</div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right col-start-1">Description</div>
   <div class="font-medium text-left text-wrap pr-0.5">{unit.description}</div>
   
</div>