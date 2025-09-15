<script lang="ts">
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
	import AddressCustomer from '$lib/displayComponents/customerViews/AddressCustomer.svelte';
	import PaymentRecordCustomer from '$lib/displayComponents/customerViews/PaymentRecordCustomer.svelte';
	import UserCustomer from '$lib/displayComponents/customerViews/UserCustomer.svelte';
   import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import DownloadPdfButton from '$lib/DownloadPDFButton.svelte';
	import EmailCustomer from '$lib/EmailCustomer.svelte';
	import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();

</script>
{#if data.paymentRecord}
   {#if data.customer}
      {#if data.address}         
         <Header title='Payment Record Num: {data.paymentRecord}' />
         <div class="m-1 sm:m-2 mt-14 sm:mt-10 mb-22 sm:mb-12 lg:mb-8 border-2 border-primary-50-950 rounded-lg">
            {#if data.user?.employee}
               <div class="flex flex-col sm:flex-row">
                  <div class="sm:w-1/2">
                     <PaymentRecordEmployee paymentRecord={data.paymentRecord} classes='px-2'/>
                     <div class="flex m-2 gap-2 flex-col sm:flex-row">
                        {#if !data.paymentRecord.refunded}
                           <a href='/refundRecords/new?paymentNum={data.paymentRecord.paymentNumber}' 
                              class="btn rounded-lg preset-filled-primary-50-950 h-8" 
                           >
                              Refund this payment
                           </a>
                        {/if}
                        {#if data.customer.email && data.customer.emailVerified}
                           <EmailCustomer 
                              recordNum={data.paymentRecord.paymentNumber} 
                              emailAddress={data.customer.email} 
                              apiEndPoint='/api/sendReceipt'
                              buttonText='Email Receipt'
                              classes='h-8'
                           />
                        {/if}
                        <DownloadPdfButton
                           recordType='paymentNum'
                           num={data.paymentRecord.paymentNumber}
                        />
                     </div>
                  </div>
                  <div class="m-2">
                     <UserEmployee user={data.customer} classes='truncate'/>
                     <AddressEmployee address={data.address} />
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
               <div class="m-2">
                  {#if data.customer.email && data.customer.emailVerified}
                     <EmailCustomer 
                        recordNum={data.paymentRecord.paymentNumber} 
                        emailAddress={data.customer.email} 
                        apiEndPoint='/api/sendReceipt'
                        buttonText='Email Receipt'
                     />
                     <a href="/api/downloadPDF?paymentNum={data.paymentRecord.paymentNumber}" 
                        class="btn preset-filled-primary-50-950 h-8" 
                        target="_blank"
                     >
                        Download PDF
                     </a>
                  {/if}
               </div>
            {/if}
         </div>
      {/if}
   {/if}
{/if}