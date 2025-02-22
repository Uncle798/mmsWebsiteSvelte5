<script lang="ts">
   import { Combobox } from '@skeletonlabs/skeleton-svelte';
   import type { PageData } from './$types';
   import NewRefundForm from '$lib/forms/NewRefundForm.svelte';
   import type { PaymentRecord } from '@prisma/client';
   import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
   import HorizontalDivider  from '$lib/displayComponents/HorizontalDivider.svelte';
   let { data }: { data: PageData } = $props();
   let selectedPayment = $state<PaymentRecord>();
   let allPayments = $state<PaymentRecord[]>([]);
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
</script>

{#if selectedPayment}
   <PaymentRecordEmployee paymentRecord={selectedPayment} classes='mt-10'/>
   <HorizontalDivider />   
   <NewRefundForm data={data.refundForm} paymentRecord={selectedPayment} classes='p-2'/>
{/if}
{#await depositWrapper}
   loading deposits
{:then deposits}
   <div class="grid grid-cols-1 gap-3 mt-10">
      {#if allPayments.length > 0}
         {#each allPayments as paymentRecord}
            <div class="flex flex-col border-2 border-primary-50 dark:border-primary-950">
               <PaymentRecordEmployee {paymentRecord} />
               <button class="btn preset-filled-primary-50-950 rounded-lg m-2" onclick={()=>{selectedPayment=paymentRecord}} >Refund this payment</button>
            </div>
         {/each}
      {/if}
   </div>
   {#await paymentsWrapper}
      <div class="grid grid-cols-1 gap-3 mt-10">
         {#if allPayments.length > 0}
         {#each allPayments as paymentRecord}
            <div class="flex flex-col border-2 border-primary-50 dark:border-primary-950">
               <PaymentRecordEmployee {paymentRecord} />
               <button class="btn preset-filled-primary-50-950 rounded-lg m-2" onclick={()=>{selectedPayment=paymentRecord}} >Refund this payment</button>
            </div>
         {/each}
      {/if}
      </div>
   {:then paymentRecords} 
      <div class="grid grid-cols-1 gap-3 mt-10">
         {#if allPayments.length > 0}
            {#each allPayments as paymentRecord}
               <div class="flex flex-col border-2 border-primary-50 dark:border-primary-950">
                  <PaymentRecordEmployee {paymentRecord} />
                  <button class="btn preset-filled-primary-50-950 rounded-lg m-2" onclick={()=>{selectedPayment=paymentRecord}} >Refund this payment</button>
               </div>
            {/each}
         {/if}
      </div>
   {/await}
{/await}

