<script lang="ts">
   import { Combobox } from '@skeletonlabs/skeleton-svelte';
   import type { PageData } from './$types';
   import NewRefundForm from '$lib/forms/NewRefundForm.svelte';
   import type { PaymentRecord } from '@prisma/client';
   import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
   import HorizontalDivider  from '$lib/displayComponents/HorizontalDivider.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import Search from '$lib/forms/Search.svelte';
   let { data }: { data: PageData } = $props();
   let selectedPayment = $state<PaymentRecord>();
   let allPayments = $state<PaymentRecord[]>([]);
   let size = $state(25);
   let pageNum = $state(1);
   let search = $state('')
   const depositWrapper = new Promise<PaymentRecord[]>(async res => {
      const deposits = await data.deposits;
      if(deposits){
         deposits.forEach((deposit) => {
            allPayments.push(deposit)
         })
         res(deposits)
      }
   })
   const paymentsWrapper = new Promise<PaymentRecord[]>(async res => {
      const payments = await data.paymentRecords;
      if(payments){
         payments.forEach((payment) => {
            const alreadyThere = allPayments.find((p) => p.paymentNumber === payment.paymentNumber)
            if(!alreadyThere){
               allPayments.push(payment)
            }
         })
      }
   })
   const slicedPayments = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.slice((pageNum -1) * size, pageNum*size));
   const searchedPayments = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.filter((paymentRecord) => paymentRecord.paymentNotes?.includes(search)))
</script>

{#if selectedPayment}
   <PaymentRecordEmployee paymentRecord={selectedPayment} classes='mt-10'/>
   <HorizontalDivider />   
   <NewRefundForm data={data.refundForm} paymentRecord={selectedPayment} classes='p-2'/>
{:else}
   {#await depositWrapper}
      <div class="mt-10 mx-2">
         loading deposits ...
      </div>
   {:then deposits}
      {#await paymentsWrapper}
         <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-10 m-2">
            <Search bind:search={search} searchType='Payment notes' data={data.searchForm} classes='col-span-full' />
            {#if allPayments.length > 0}
               {#each slicedPayments(allPayments) as paymentRecord}
                  <div class="flex flex-col border-2 border-primary-50 dark:border-primary-950 rounded-lg">
                     <PaymentRecordEmployee {paymentRecord} />
                     <button class="btn preset-filled-primary-50-950 rounded-lg m-2" onclick={()=>{selectedPayment=paymentRecord}} >Refund this payment</button>
                  </div>
               {/each}
               <Pagination bind:size={size} bind:pageNum={pageNum} array={allPayments} label='deposits' classes='col-span-3'/>
            {/if}
         </div>
      {:then paymentRecords} 
         <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-10 m-2">
            {#if allPayments.length > 0}
               {#each allPayments as paymentRecord}
                  <div class="flex flex-col border-2 border-primary-50 dark:border-primary-950 rounded-lg">
                     <PaymentRecordEmployee {paymentRecord} />
                     <button class="btn preset-filled-primary-50-950 rounded-lg m-2" onclick={()=>{selectedPayment=paymentRecord}} >Refund this payment</button>
                  </div>
               {/each}
            {/if}
         </div>
      {/await}
   {/await}
{/if}
