<script lang="ts">
	import Address from '$lib/displayComponents/AddressEmployee.svelte';
	import AddressCustomer from '$lib/displayComponents/customerViews/AddressCustomer.svelte';
	import InvoiceCustomer from '$lib/displayComponents/customerViews/InvoiceCustomer.svelte';
	import PaymentRecordCustomer from '$lib/displayComponents/customerViews/PaymentRecordCustomer.svelte';
	import RefundRecordCustomer from '$lib/displayComponents/customerViews/RefundRecordCustomer.svelte';
	import UserCustomer from '$lib/displayComponents/customerViews/UserCustomer.svelte';
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
   <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 mx-2 mt-10 border-2 dark:border-primary-950 border-primary-50 rounded-lg">
      <div class="flex flex-col p-2">
         <PaymentRecordEmployee paymentRecord={data.paymentRecord} classes=''/>
         {#if !data.paymentRecord.refunded}
            <a href='/refundRecords/new?paymentNumber={data.paymentRecord.paymentNumber}' class="btn rounded-lg preset-filled-primary-50-950 m-2">Refund this payment</a>
         {/if}
         <form method="POST">
            <input type="hidden" value={data.paymentRecord.paymentNumber} name='paymentRecordNumber' />
            <button type="submit" class="btn rounded-lg preset-filled-primary-50-950 m-2">Email receipt</button>
         </form>
      </div>
      <div class="flex flex-col p-2">
         {#if data.customer}
            <UserEmployee user={data.customer} classes=''/>
            {#if data.address}
               <Address address={data.address} />
            {/if}
         {/if}
      </div>
      {#if data.invoice}
         <InvoiceEmployee invoice={data.invoice} classes='p-2'/>
      {/if}
      {#if data.refundRecord}
         <RefundRecordEmployee refundRecord={data.refundRecord} classes='p-2 '/>
      {/if}
   </div>
   {/if}
{:else}
   {#if data.paymentRecord}
      <Header title='Payment Record Num: {data.paymentRecord}' />
      <div class="grid grid-cols-1 gap-3 sm:mx-2 mx-1 mt-10 sm:grid-cols-2">
         <div class="flex flex-col">
            <PaymentRecordCustomer paymentRecord={data.paymentRecord} classes=''/>
            <form method="POST">
               <input type="hidden" value={data.paymentRecord.paymentNumber} name='paymentRecordNumber' />
               <button type="submit" class="btn rounded-lg preset-filled-primary-50-950 m-2">Email receipt</button>
            </form>
         </div>
         <div class="flex flex-col ">
            {#if data.customer}
               <UserCustomer user={data.customer} classes='mx-1 sm:mx-2'/>
               {#if data.address}
                  <AddressCustomer address={data.address} classes='mx-1 sm:mx-2'/>
               {/if}
            {/if}
         </div>
         {#if data.invoice}
            <InvoiceCustomer invoice={data.invoice} classes='m-2 sm:col-span-2'/>
         {/if}
         {#if data.refundRecord}
            <RefundRecordCustomer refundRecord={data.refundRecord} classes='m-2 sm:col-span-2'/>
         {/if}
      </div>
   {/if}
{/if}