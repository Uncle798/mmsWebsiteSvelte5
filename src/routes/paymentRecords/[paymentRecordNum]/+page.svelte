<script lang="ts">
	import Address from '$lib/displayComponents/Address.svelte';
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
   <div class="flex border-t-2 dark:border-primary-950 border-primary-50">
      <div class="flex flex-col p-2 min-w-60 border-b-2 border-e-2 border-primary-950">
         <PaymentRecordEmployee paymentRecord={data.paymentRecord} classes=''/>
         {#if !data.paymentRecord.refunded}
            <a href='/refundRecords/new?paymentNumber={data.paymentRecord.paymentNumber}' class="btn rounded-lg preset-filled-primary-50-950 m-2">Refund this payment</a>
         {/if}
      </div>
      <div class="flex flex-col p-2 min-w-60 border-b-2 border-e-2 border-primary-950">
         {#if data.customer}
            <User user={data.customer} classes=''/>
            {#if data.address}
               <Address address={data.address} />
            {/if}
         {/if}
      </div>
      {#if data.invoice}
         <InvoiceEmployee invoice={data.invoice} classes='p-2 min-w-60 border-b-2 border-e-2 border-primary-950'/>
      {/if}
      {#if data.refundRecord}
         <RefundRecordDisplay refundRecord={data.refundRecord} classes='p-2 min-w-60 border-b-2 border-primary-950 '/>
      {/if}
   </div>
   <HorizontalDivider />
{/if}