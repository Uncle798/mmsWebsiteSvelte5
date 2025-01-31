<script lang='ts'>
	import type { DiscountCode } from "@prisma/client";
	import dayjs from "dayjs";

   interface Props {
      discount: DiscountCode;
   }
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
   let { discount }:Props = $props();
</script>

<div class="m-4 w-1/3 flex-none">
   <p>Code: {discount.code}</p>
   <p>Amount Off: {currencyFormatter.format(discount.amountOff)}</p>
   <p>Notes: {discount.notes}</p>
   <p>Date created {dayjs(discount.discountCreated).format('M/D/YYYY')}</p>
</div>