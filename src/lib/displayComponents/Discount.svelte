<script lang='ts'>
	import type { DiscountCode } from "@prisma/client";
	import dayjs from "dayjs";


   interface Props {
      discount: DiscountCode;
   }
   let { discount }:Props = $props();
</script>

<div class="card">
   <p>Code: {discount.code}</p>
   <p>Amount Off: ${discount.amountOff}</p>
   <p>Notes: {discount.notes}</p>
   <p>Date created {dayjs(discount.discountCreated).format('M/D/YYYY')}</p>
</div>