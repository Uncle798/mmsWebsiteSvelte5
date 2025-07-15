<script lang="ts">
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
	import AddressCustomer from '$lib/displayComponents/customerViews/AddressCustomer.svelte';
	import PaymentRecordCustomer from '$lib/displayComponents/customerViews/PaymentRecordCustomer.svelte';
	import UserCustomer from '$lib/displayComponents/customerViews/UserCustomer.svelte';
   import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import EmailCustomer from '$lib/emailCustomer.svelte';
	import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();

</script>
{#if data.paymentRecord }
   <Header title='Payment Record Num: {data.paymentRecord}' />
   <div class="grid grid-cols-1 m-1 sm:m-2 mt-14 sm:mt-10 mb-22 sm:mb-12 lg:mb-7 border-2 border-primary-50-950 rounded-lg w-fit">
         {#if data.user?.employee}
            <PaymentRecordEmployee paymentRecord={data.paymentRecord} classes=''/>
         {:else}
            <PaymentRecordCustomer paymentRecord={data.paymentRecord} />
         {/if}
         <div class="flex flex-col mx-2">
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
            {#if data.customer.email && data.customer.emailVerified}
               <EmailCustomer 
                  recordNum={data.paymentRecord.paymentNumber} 
                  emailAddress={data.customer.email} 
                  apiEndPoint='/api/sendReceipt'
                  buttonText='Email Receipt'
               />
            {/if}
         {/if}
         </div>
         {#if !data.paymentRecord.refunded}
            <a href='/refundRecords/new?paymentNumber={data.paymentRecord.paymentNumber}' class="btn rounded-lg preset-filled-primary-50-950 m-2 mt-0">Refund this payment</a>
         {/if}
   </div>
{/if}