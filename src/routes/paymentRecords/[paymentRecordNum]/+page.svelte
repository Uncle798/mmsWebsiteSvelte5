<script lang="ts">
	import Address from '$lib/displayComponents/Address.svelte';
	import InvoiceCustomer from '$lib/displayComponents/customerViews/InvoiceCustomer.svelte';
	import PaymentRecordCustomer from '$lib/displayComponents/customerViews/PaymentRecordCustomer.svelte';
	import RefundRecordCustomer from '$lib/displayComponents/customerViews/RefundRecordCustomer.svelte';
   import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
   import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
	import RefundRecordEmployee from '$lib/displayComponents/RefundRecordEmployee.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();
</script>
{#if data.user?.employee}
   {#if data.paymentRecord }
   <Header title='Payment Record Num: {data.paymentRecord}' />
   <div class="grid grid-cols-4 gap-1 m-2">
      <div class="flex flex-col p-2 border-2 dark:border-primary-950 border-primary-50 rounded-lg">
         <PaymentRecordEmployee paymentRecord={data.paymentRecord} classes=''/>
         {#if !data.paymentRecord.refunded}
            <a href='/refundRecords/new?paymentNumber={data.paymentRecord.paymentNumber}' class="btn rounded-lg preset-filled-primary-50-950 m-2">Refund this payment</a>
         {/if}
         <form method="POST">
            <input type="hidden" value={data.paymentRecord.paymentNumber} name='paymentRecordNumber' />
            <button type="submit" class="btn rounded-lg preset-filled-primary-50-950 m-2">Email receipt</button>
         </form>
      </div>
      <div class="flex flex-col p-2 border-2 dark:border-primary-950 border-primary-50 rounded-lg">
         {#if data.customer}
            <UserEmployee user={data.customer} classes=''/>
            {#if data.address}
               <Address address={data.address} />
            {/if}
         {/if}
      </div>
      {#if data.invoice}
         <InvoiceEmployee invoice={data.invoice} classes='p-2 border-2 dark:border-primary-950 border-primary-50 rounded-lg'/>
      {/if}
      {#if data.refundRecord}
         <RefundRecordEmployee refundRecord={data.refundRecord} classes='p-2 border-2 dark:border-primary-950 border-primary-50 rounded-lg'/>
      {/if}
   </div>
   {/if}
   {:else}
   {#if data.paymentRecord}
      <Header title='Payment Record Num: {data.paymentRecord}' />
      <div class="grid grid-cols-4 gap-1 m-2">
         <div class="flex flex-col p-2 border-2 dark:border-primary-950 border-primary-50 rounded-lg">
            <PaymentRecordCustomer paymentRecord={data.paymentRecord} classes=''/>
            <form method="POST">
               <input type="hidden" value={data.paymentRecord.paymentNumber} name='paymentRecordNumber' />
               <button type="submit" class="btn rounded-lg preset-filled-primary-50-950 m-2">Email receipt</button>
            </form>
         </div>
         <div class="flex flex-col p-2 border-2 dark:border-primary-950 border-primary-50 rounded-lg">
            {#if data.customer}
               <UserEmployee user={data.customer} classes=''/>
               {#if data.address}
                  <Address address={data.address} />
               {/if}
            {/if}
         </div>
         {#if data.invoice}
            <InvoiceCustomer invoice={data.invoice} classes='p-2 border-2 dark:border-primary-950 border-primary-50 rounded-lg'/>
         {/if}
         {#if data.refundRecord}
            <RefundRecordCustomer refundRecord={data.refundRecord} classes='p-2 border-2 dark:border-primary-950 border-primary-50 rounded-lg'/>
         {/if}
      </div>
   {/if}
{/if}