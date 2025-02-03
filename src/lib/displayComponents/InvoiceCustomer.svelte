<script lang="ts">
   import type { Invoice } from "@prisma/client";
   import dayjs from "dayjs";
   interface Props {
      invoice:Invoice;
      classes?: string;
   }
   let { invoice, classes }:Props = $props();
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
</script>

<div class="m-4 flex-none {classes}">
   <p>Invoice number: {invoice.invoiceNum}</p>
   <p>Invoice amount: {currencyFormatter.format(invoice.invoiceAmount)}</p>
   <p>Created: {dayjs(invoice.invoiceCreated).format('M/D/YYYY')}</p>
   <p>{invoice.invoiceNotes}</p>
</div>