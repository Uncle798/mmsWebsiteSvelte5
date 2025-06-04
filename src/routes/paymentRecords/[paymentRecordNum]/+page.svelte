<script lang="ts">
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
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
{#if data.paymentRecord }
   <Header title='Payment Record Num: {data.paymentRecord}' />
   <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 m-1 sm:m-2 mt-10 sm:mt-10 mb-22 sm:mb-12 lg:mb-7 border-2 border-primary-50-950 rounded-lg w-fit">
      <div class="flex flex-col p-2">
         {#if data.user?.employee}
            <PaymentRecordEmployee paymentRecord={data.paymentRecord} classes=''/>
            {#if !data.paymentRecord.refunded}
               <a href='/refundRecords/new?paymentNumber={data.paymentRecord.paymentNumber}' class="btn rounded-lg preset-filled-primary-50-950 m-2">Refund this payment</a>
            {/if}
         {:else}
            <PaymentRecordCustomer paymentRecord={data.paymentRecord} />
         {/if}
         <form method="POST">
            <input type="hidden" value={data.paymentRecord.paymentNumber} name='paymentRecordNumber' />
            <button type="submit" class="btn rounded-lg preset-filled-primary-50-950 m-2">Email receipt</button>
         </form>
      </div>
      <div class="flex flex-col p-2">
         {#if data.customer}
            {#if data.user?.employee}
               <UserEmployee user={data.customer} classes=''/>
            {:else}
               <UserCustomer user={data.customer} />
            {/if}
            {#if data.address}
               {#if data.user?.employee}
                  <AddressEmployee address={data.address} />
               {:else}
                  <AddressCustomer address={data.address} />
               {/if}
            {/if}
         {/if}
      </div>

   </div>
{/if}