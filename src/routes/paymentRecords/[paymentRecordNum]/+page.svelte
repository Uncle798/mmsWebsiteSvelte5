<script lang="ts">
	import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
   import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
	import RefundRecordDisplay from '$lib/displayComponents/RefundRecordDisplay.svelte';
	import User from '$lib/displayComponents/User.svelte';
	import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();
</script>

{#if data.paymentRecord }
   <Header title='Payment Record Num: {data.paymentRecord}' />
   <div class=flex>
      <PaymentRecordEmployee
 paymentRecord={data.paymentRecord} />

      {#if data.customer}
         <User user={data.customer} />
      {/if}
      {#if data.invoice}
         <InvoiceEmployee invoice={data.invoice} />
      {/if}
      {#if data.refundRecord}
         <RefundRecordDisplay refundRecord={data.refundRecord} />
      {/if}
   </div>
{/if}