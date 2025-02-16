<script lang="ts">
   import Address from '$lib/displayComponents/Address.svelte';
   import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
   import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import AddressForm from '$lib/forms/AddressForm.svelte';
   import { Modal } from '@skeletonlabs/skeleton-svelte';
   import User from '$lib/displayComponents/User.svelte';
   import type { PageData } from './$types';
   import LeaseEndForm from '$lib/forms/LeaseEndForm.svelte';
   import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
   import Header from '$lib/Header.svelte';
   import type { Invoice, PaymentRecord } from '@prisma/client';
	import RefundRecordDisplay from '$lib/displayComponents/RefundRecordEmployee.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import dayjs from 'dayjs';
   let { data }: { data: PageData } = $props();
   let addressModalOpen = $state(false);
   let leaseEndModalOpen = $state(false);
   let search = $state('')
   let pageNum = $state(1);
   let size = $state(5);
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
   let slicedPayments = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.slice((pageNum -1) * size, pageNum*size));
   const slicedInvoices = $derived((invoices:Invoice[]) => invoices.slice((pageNum - 1) * size, pageNum * size));
   let searchedPayments = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.filter((paymentRecord) => paymentRecord.paymentNumber.toString().includes(search) ))
   let totalInvoiced = $state(0);
   let totalPaid = $state(0)
   let difference =$state(0)
   const wrapper = new Promise<Invoice[]>(async res => {
      const invoices = await data.invoices;
      const payments = await data.paymentRecords;
      invoices.forEach((invoice) => {
         if(!invoice.deposit){
            totalInvoiced += invoice.invoiceAmount
         }
      })
      payments.forEach((payment) => {
         if(!payment.deposit){
            totalPaid += payment.paymentAmount
         }
      })
      difference = totalInvoiced - totalPaid
      res(invoices)   
   })
</script>

{#if data.dbUser}
   <Header title='{data.dbUser.givenName} {data.dbUser.familyName}' />
   <User user={data.dbUser} classes='px-2 pt-2' />
{:else}
...loading user
{/if}
{#if data.address}
   <Address bind:address={data.address} classes='px-2'/>
   <Modal
      bind:open={addressModalOpen}
      triggerBase="btn preset-filled-primary-50-950 rounded-lg mx-2 "
      contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
      backdropClasses="backdrop-blur-sm"
   >
   {#snippet trigger()}
      Change Address
   {/snippet}
   {#snippet content()}
      <AddressForm data={data.addressForm} bind:addressModalOpen={addressModalOpen} userId={data.dbUser?.id!}/>
      <button class="btn preset-filled-primary-50-950 rounded-lg" onclick={()=>addressModalOpen=false}>Close</button>
   {/snippet}
   </Modal>
{:else}
   ...loading address
{/if}
<div class="">
{#await data.leases}
   ...loading leases
{:then leases}
      {#each leases as lease}
         <LeaseEmployee lease={lease} classes='m-2 rounded-lg border-2 border-primary-50 dark:border-primary-950'/>
         {#if !lease?.leaseEnded}
            <Modal
               bind:open={leaseEndModalOpen}
               triggerBase="btn preset-tonal "
               contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
               backdropClasses="backdrop-blur-sm"
            >  
            {#snippet trigger()}
               End Lease
            {/snippet}
            {#snippet content()}
               <LeaseEndForm data={data.leaseEndForm} leaseId={lease.leaseId} leaseEndModalOpen={leaseEndModalOpen}/>
            {/snippet}   
            </Modal>
         {/if}
      {/each}
{/await}
</div>
<div>
{#await wrapper}
    <div class='col-span-1'>
        ...loading invoices
    </div>
{:then invoices}
   {#await data.paymentRecords}
      ...loading payment records
   {:then paymentRecords} 
      {#await data.refunds}
         ...loading refunds
      {:then refunds}
         <div>
            <span class="ml-2">Total invoiced: {currencyFormatter.format(totalInvoiced)}</span>
            <span>Total paid: {currencyFormatter.format(totalPaid)}</span>
            {#if difference < 0}
               <span class="text-red-700 dark:text-red-500">Outstanding balance: {currencyFormatter.format(difference)}</span>
               {#if dayjs(invoices[0].invoiceCreated).add(1,'month') < dayjs()}
                  <span class="text-red-700 dark:text-red-500">Due: {dayjs(invoices[0].invoiceCreated).add(1, 'month').format('MMMM D YYYY')}</span>
               {:else}
                  <span class="text-green-700 dark:text-green-500">Due: {dayjs(invoices[0].invoiceCreated).add(1, 'month').format('MMMM D YYYY')}</span>
               {/if}
            {:else if difference < 0 }   
               <span class="text-green-700 dark:text-green-500">Outstanding balance: {currencyFormatter.format(difference)}</span>
            {/if}
         </div>
         {#if refunds.length > 0}
         <div class="grid grid-cols-3 gap-x-1 gap-y-3 mx-2 ">
            {#each slicedInvoices(invoices) as invoice}
            {@const paymentRecord = paymentRecords.find((payment) => payment.invoiceNum === invoice.invoiceNum)}
            {@const refund = refunds.find((refund) => refund.paymentRecordNum === paymentRecord?.paymentNumber)}
                  <InvoiceEmployee invoice={invoice} classes='rounded-lg border-2 border-primary-50 dark:border-primary-950'/>
                  {#if paymentRecord}
                     <PaymentRecordEmployee paymentRecord={paymentRecord} classes='rounded-lg border-2 border-primary-50 dark:border-primary-950'/>
                  {:else}
                     <div class="min-w-1/3"></div>
                  {/if}
                  {#if refund}
                     <RefundRecordDisplay refundRecord={refund} classes='rounded-lg border-2 border-primary-50 dark:border-primary-950 min-h-72'/>
                  {:else}
                     <div class="min-w-1/3"></div>
                  {/if}
                  {/each}
            </div>
         {:else}
            <div class="grid grid-cols-2 gap-x-1 gap-y-3 mx-2">
            {#each slicedInvoices(invoices) as invoice}
            {@const paymentRecord = paymentRecords.find((payment) => payment.invoiceNum === invoice.invoiceNum)}
               <InvoiceEmployee invoice={invoice} classes='rounded-lg border-2 border-primary-50 dark:border-primary-950'/>
               {#if paymentRecord}
                  <PaymentRecordEmployee paymentRecord={paymentRecord} classes='rounded-lg border-2 border-primary-50 dark:border-primary-950'/>               
               {/if}
            {/each}
            </div>
         {/if}
         <Pagination bind:pageNum={pageNum} bind:size={size} label='invoices' array={invoices} />
      {/await}
   {/await}
{/await}    
</div>