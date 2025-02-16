<script lang='ts'>
	import type { DiscountCode } from "@prisma/client";
	import dayjs from "dayjs";

   interface Props {
      discount: DiscountCode;
      classes?: string;
   }
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
   let { discount, classes }:Props = $props();
</script>

<div class="{classes} grid grid-cols-2 gap-x-2">
   <div class="text-right">Code</div> <div>{discount.code}</div>
   {#if discount.percentage}
      <div class="text-right">Percent Off</div><div>{discount.amountOff}%</div>
   {:else}
      <div class="text-right">Amount Off</div><div>{currencyFormatter.format(discount.amountOff)}</div>
   {/if}
   <div class="text-right">Date created</div><div>{dayjs(discount.discountCreated).format('M/D/YYYY')}</div>
   <div class="text-right">Notes</div><div class=" text-wrap">{discount.notes}</div>
</div>