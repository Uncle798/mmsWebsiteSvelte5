<script lang="ts">
   import type { Invoice } from "@prisma/client";
   import dayjs from "dayjs";
   interface Props {
      invoice:Invoice;
   }
   let { invoice }:Props = $props();
</script>

<div class="card p-4">
   <span>${invoice.invoiceAmount}</span>
   <span>Created: {dayjs(invoice.invoiceCreated).format('M/D/YYYY')}</span>
   
</div>