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
   {#if data.customer}
      {#if data.customer}
         {#if data.address}         
            <Header title='Payment Record Num: {data.paymentRecord}' />
            <div class="m-1 sm:m-2 mt-14 sm:mt-10 mb-22 sm:mb-12 lg:mb-7 border-2 border-primary-50-950 rounded-lg">
               {#if data.user?.employee}
                  <div class="flex flex-col sm:flex-row">
                     <PaymentRecordEmployee paymentRecord={data.paymentRecord} classes=''/>
                     <div>
                        <UserEmployee user={data.customer} classes='truncate'/>
                        <AddressEmployee address={data.address} />
                        {#if !data.paymentRecord.refunded}
                           <a href='/refundRecords/new?paymentNum={data.paymentRecord.paymentNumber}' class="btn rounded-lg preset-filled-primary-50-950 m-2 col-span-2 h-8">Refund this payment</a>
                        {/if}
                     </div>
                  </div>
               {:else}
                  <div class="grid grid-cols-1 sm:grid-cols-2">
                     <PaymentRecordCustomer paymentRecord={data.paymentRecord} />
                     <div>
                        <UserCustomer user={data.customer} />
                        <AddressCustomer address={data.address} />
                     </div>
                  </div>
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
         {/if}
      {/if}
   {/if}
{/if}