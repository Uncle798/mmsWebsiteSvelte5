<script lang="ts">
   import type { PageData } from './$types';
   import Header from '$lib/Header.svelte';
	import PaymentRecordCustomer from '$lib/displayComponents/customerViews/PaymentRecordCustomer.svelte';
	import UserCustomer from '$lib/displayComponents/customerViews/UserCustomer.svelte';
	import AddressCustomer from '$lib/displayComponents/customerViews/AddressCustomer.svelte';
   let { data }: { data: PageData } = $props();
</script>

<Header title="Thanks!" />
<div class="flex border-2 border-primary-50 dark:border-primary-950 mt-10 mx-1 sm:mx-2 rounded-lg">
   Thanks for your business!
   {#if data.paymentRecord}
      <PaymentRecordCustomer paymentRecord={data.paymentRecord} classes='px-2 w-1/2'/>
      {#if data.customer}
         <div class="flex flex-col px-2 pt-2 w-1/2">
            <UserCustomer user={data.customer} />
            {#if data.address}
               <AddressCustomer address={data.address} />
            {/if}
      </div>
      {/if}
   {/if}
</div>