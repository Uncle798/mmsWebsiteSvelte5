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

<div class="{classes}">
   <p>Code: {discount.code}</p>
   <p>Amount Off: {currencyFormatter.format(discount.amountOff)}</p>
   <p>Notes: {discount.notes}</p>
   <p>Date created {dayjs(discount.discountCreated).format('M/D/YYYY')}</p>
</div>