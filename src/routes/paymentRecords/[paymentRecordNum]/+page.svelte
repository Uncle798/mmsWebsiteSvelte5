<script lang="ts">
	import HorizontalDivider from '$lib/displayComponents/HorizontalDivider.svelte';
import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
   import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
	import RefundRecordDisplay from '$lib/displayComponents/RefundRecordDisplay.svelte';
	import User from '$lib/displayComponents/User.svelte';
	import VerticalDivider from '$lib/displayComponents/VerticalDivider.svelte';
	import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();
</script>

{#if data.paymentRecord }
   <Header title='Payment Record Num: {data.paymentRecord}' />
   <div class=flex>
      <PaymentRecordEmployee paymentRecord={data.paymentRecord} classes='w-1/3'/>
      <VerticalDivider classes=''/>
      {#if data.customer}
         <User user={data.customer} classes='w-1/3'/>
         <VerticalDivider classes='' />
      {/if}
      {#if data.invoice}
         <InvoiceEmployee invoice={data.invoice} classes='w-1/3'/>
      {/if}
      {#if data.refundRecord}
         <RefundRecordDisplay refundRecord={data.refundRecord} />
      {/if}

   </div>
   <HorizontalDivider />
{/if}