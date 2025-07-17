<script lang="ts">
   import type { PageData } from './$types';
   import Header from '$lib/Header.svelte';
	import PaymentRecordCustomer from '$lib/displayComponents/customerViews/PaymentRecordCustomer.svelte';
	import UserCustomer from '$lib/displayComponents/customerViews/UserCustomer.svelte';
	import AddressCustomer from '$lib/displayComponents/customerViews/AddressCustomer.svelte';
   let { data }: { data: PageData } = $props();
</script>

<Header title="Thanks!" />
<div class="flex flex-col sm:flex-row border-2 border-primary-50-950 m-1 sm:m-2 rounded-lg mt-14 sm:mt-10">
   {#await data.customerPromise}
      <span class="m-2">Thanks for your business!</span>
   {:then customer} 
      {#await data.paymentRecordPromise}
         <span class="m-2">Thanks for your business!</span>
         {:then paymentRecord}
         {#await data.addressPromise}
            <span class="m-2">Thanks for your business!</span>
            {:then address} 
               <span class="m-2 sm:w-1/3">Thanks for your business!</span> 
               {#if paymentRecord}
                  <PaymentRecordCustomer {paymentRecord} />
               {/if}
               <div class="m-2 sm:w-1/3">
                  {#if customer}
                     <UserCustomer user={customer} />
                  {/if}
                  {#if address}
                     <AddressCustomer {address} />
                  {/if}
               </div>
         {/await}
      {/await}
   {/await}
</div>