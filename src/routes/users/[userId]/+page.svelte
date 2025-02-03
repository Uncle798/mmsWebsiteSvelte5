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
	import RefundRecordDisplay from '$lib/displayComponents/RefundRecordDisplay.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import HorizontalDivider from '$lib/displayComponents/HorizontalDivider.svelte';
	import VerticalDivider from '$lib/displayComponents/VerticalDivider.svelte';
   let { data }: { data: PageData } = $props();
   let addressModalOpen = $state(false);
   let leaseEndModalOpen = $state(false);
   let search = $state('')
   let pageNum = $state(1);
   let size = $state(5);
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
   let slicedSource = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.slice((pageNum -1) * size, pageNum*size));
   let searchedPayments = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.filter((paymentRecord) => paymentRecord.paymentNumber.toString().includes(search) ))
   let totalPayments = $derived((paymentRecords:PaymentRecord[]) => {
      let totalRevenue = 0;
      paymentRecords.forEach((paymentRecord) => {
         if(paymentRecord.paymentCompleted){
               totalRevenue += paymentRecord.paymentAmount
         }
      })
      return totalRevenue;
   })
   let totalInvoices = $derived((invoices:Invoice[]) => {
      let totalRevenue = 0;
      invoices.forEach((invoice) => {
         totalRevenue += invoice.invoiceAmount
      })
      return totalRevenue;
   })
   let difference =$state(0)
   const wrapper = new Promise<Invoice[]>(async res => {
      const invoices = await data.invoices;
      const payments = await data.paymentRecords;
      let totalInvoiced = 0;
      invoices.forEach((invoice) => {
         if(!invoice.deposit){
            totalInvoiced += invoice.invoiceAmount
         }
      })
      let totalPayed = 0;
      payments.forEach((payment) => {
         if(!payment.deposit){
            totalPayed += payment.paymentAmount
         }
      })
      difference = totalInvoiced - totalPayed
      res(invoices)   
   })
</script>

{#if data.dbUser}
   <Header title='{data.dbUser.givenName} {data.dbUser.familyName}' />
   <User user={data.dbUser}/>
{:else}
...loading user
{/if}
{#if data.address}
   <Address bind:address={data.address}/>
   <Modal
      bind:open={addressModalOpen}
      triggerBase="btn preset-tonal "
      contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
      backdropClasses="backdrop-blur-sm"
   >
   {#snippet trigger()}
      Change Address
   {/snippet}
   {#snippet content()}
      <AddressForm data={data.addressForm} bind:addressModalOpen={addressModalOpen} userId={data.dbUser?.id!}/>
      <button class="btn" onclick={()=>addressModalOpen=false}>Close</button>
   {/snippet}
   </Modal>
{:else}
   ...loading address
{/if}
<div class="card m-2">
{#await data.leases}
   ...loading leases
{:then leases}
      {#each leases as lease}
         <LeaseEmployee lease={lease} />
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
            <span>Total invoiced: {currencyFormatter.format(totalInvoices(invoices))}</span>
            <span>Total payed: {currencyFormatter.format(totalPayments(paymentRecords))}</span>
            <span class="">Outstanding balance: {currencyFormatter.format(difference)}</span>
         </div>
         <HorizontalDivider />
         {#each invoices as invoice}
         {@const paymentRecord = paymentRecords.find((payment) => payment.invoiceNum === invoice.invoiceNum)}
         {@const refund = refunds.find((refund) => refund.paymentRecordNum === paymentRecord?.paymentNumber)}
            <div class="flex">
               <InvoiceEmployee invoice={invoice} />
               {#if paymentRecord}
                  <div class="grid h-50 grid-cols-[1fr_auto_auto_auto_auto_1fr] items-center gap-4">
                     <span class="vr border-t-2"></span>
                  </div>
                  <PaymentRecordEmployee paymentRecord={paymentRecord}/>
                  {/if}
                  {#if refund}
                  <VerticalDivider heightClass='h-50' />
                  <RefundRecordDisplay refundRecord={refund} />
               {/if}
            </div>
            <HorizontalDivider />
         {/each}
         <Pagination bind:pageNum={pageNum} bind:size={size} label='invoices' array={invoices} />
      {/await}
   {/await}
{/await}    
</div>