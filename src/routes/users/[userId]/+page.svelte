<script lang="ts">
   import Address from '$lib/displayComponents/AddressEmployee.svelte';
   import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
   import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import AddressForm from '$lib/forms/AddressForm.svelte';
   import { Modal } from '@skeletonlabs/skeleton-svelte';
   import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
   import type { PageData } from './$types';
   import LeaseEndForm from '$lib/forms/LeaseEndForm.svelte';
   import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
   import Header from '$lib/Header.svelte';
   import type { Invoice, PaymentRecord } from '@prisma/client';
	import RefundRecordDisplay from '$lib/displayComponents/RefundRecordEmployee.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import EmailChangeForm from '$lib/forms/EmailChangeForm.svelte';
	import EmailVerificationForm from '$lib/forms/EmailVerificationForm.svelte';
   let { data }: { data: PageData } = $props();

   let globalModalOpen = $state(false);
   let modalReason = $state('');
   let currentLeaseId = $state('');
   let pageNum = $state(1);
   let size = $state(5);
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
   const slicedInvoices = $derived((invoices:Invoice[]) => invoices.slice((pageNum - 1) * size, pageNum * size));
   const derivedTotalInvoiced = $derived((invoices:Invoice[]) => {
      let total = 0;
      for(const invoice of invoices){
         if(!invoice.deposit){
            total += invoice.invoiceAmount
         }
      }
      return total;
   })
   const derivedTotalPaid = $derived((payments:PaymentRecord[]) => {
      let total = 0;
      for(const payment of payments){
         if(!payment.deposit){
            total += payment.paymentAmount
         }
      }
      return total
   })
   const overDueInvoices = $derived((invoices:Invoice[]) => {
      const returnedInvoices:Invoice[] = [];
      for(const invoice of invoices){
         if(invoice.invoiceDue < new Date() && !invoice.paymentRecordNum && !invoice.deposit){
            returnedInvoices.push(invoice)
         }
      }
      return returnedInvoices;
   })
   function leaseModal(leaseId:string) {
      currentLeaseId = leaseId;
      modalReason = 'leaseEnd';
      globalModalOpen = true;
   }
</script>
<Modal
   open={globalModalOpen}
   onOpenChange={(e) => globalModalOpen = e.open}
   triggerBase="btn preset-filled-primary-50-950 rounded-lg m-2"
   contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-(--breakpoint-sm)"
   backdropClasses="backdrop-blur-xl"
   modal={true}
>
   {#snippet content()}
      {#if modalReason === 'emailChange'}
         <EmailChangeForm data={data.emailChangeForm} bind:emailModalOpen={globalModalOpen} />
      {:else if modalReason === 'emailVerification'}
         <EmailVerificationForm 
            data={data.emailVerificationForm}
            userId={data.dbUser.id}
            bind:emailVerificationModalOpen={globalModalOpen}
            redirect='false'
         />
      {:else if modalReason === 'addressChange'}
         <AddressForm
            data={data.addressForm}
            userId={data.dbUser.id}
            bind:addressModalOpen={globalModalOpen}
         />
      {:else if modalReason === 'leaseEnd'}
         <LeaseEndForm
            data={data.leaseEndForm}
            bind:leaseEndModalOpen={globalModalOpen}
            leaseId={currentLeaseId}
         />
      {/if}
      <button class="btn preset-filled-primary-50-950" onclick={()=>globalModalOpen=false}>Close</button>
   {/snippet}
</Modal>

{#if data.dbUser}
   <Header title='{data.dbUser.givenName} {data.dbUser.familyName}' />
   <UserEmployee user={data.dbUser} classes='mx-2 mt-14 sm:mt-10' />
   <button class="btn preset-filled-primary-50-950 mx-2" 
      onclick={()=>{
         modalReason='emailChange' 
         globalModalOpen=true
      }} 
      type='button'
      >
         Change email address
      </button>
   {#if !data.dbUser.emailVerified}      
      <button class="btn preset-filled-primary-50-950 mx-2" 
         onclick={()=>{
            modalReason='emailVerify' 
            globalModalOpen=true
         }} 
         type='button'
         >
            Verify email address
         </button>
   {/if}
{:else}
...loading user
{/if}
{#if data.address}
   <Address address={data.address} classes='px-2'/>
   <button class="btn preset-filled-primary-50-950 mx-2"
      onclick={()=>{
         modalReason='addressChange' 
         globalModalOpen=true
      }} 
      type='button'
      >
         Change address
      </button>
   {:else}
      <button class="btn preset-filled-primary-50-950 mx-2"
         onclick={()=>{
            modalReason='addressChange' 
            globalModalOpen=true
         }} 
         type='button'
         >
            Add address
         </button>
{/if}
{#await data.leases}
...loading leases
{:then leases}
   <div class="grid grid-cols-1 sm:grid-cols-2">
      {#each leases as lease}
         <div class="rounded-lg border-2 border-primary-50 dark:border-primary-950 flex flex-col m-2">
            <LeaseEmployee lease={lease} classes='m-2'/>
            {#if !lease?.leaseEnded}
               <button class="btn preset-filled-primary-50-950 m-2"  
                  onclick={()=>leaseModal(lease.leaseId)} 
                  type='button'
               >
                  End lease
               </button>
            {/if}
         </div>
      {/each}
   </div>
{/await}
<div class="mb-9">
{#await data.invoices}
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
         <div class="flex ">
            <span class="mx-1">Total invoiced (not including deposits): {currencyFormatter.format(derivedTotalInvoiced(invoices))}</span>
            <span class="mx-1">Total paid (not including deposits): {currencyFormatter.format(derivedTotalPaid(paymentRecords))}</span>
            {#if derivedTotalInvoiced(invoices) - derivedTotalPaid(paymentRecords) > 0}
               <span class="mx-1 dark:text-red-500 text-red-700">Outstanding Balance: {currencyFormatter.format(derivedTotalInvoiced(invoices) - derivedTotalPaid(paymentRecords))}</span>
               {#if overDueInvoices(invoices).length > 0}
                  <span class="mx-1 dark:text-red-500 text-red-700">Overdue Balance: {currencyFormatter.format(derivedTotalInvoiced(overDueInvoices(invoices)))}</span>
               {/if}
            {/if}
         </div>
         {#if refunds.length > 0}
         <div class="grid grid-cols-1 lg:grid-cols-3 gap-x-1 gap-y-3 mx-2 ">
            {#each slicedInvoices(invoices) as invoice}
            {@const paymentRecord = paymentRecords.find((payment) => payment.invoiceNum === invoice.invoiceNum)}
            {@const refund = refunds.find((refund) => refund.paymentRecordNum === paymentRecord?.paymentNumber)}
                  <InvoiceEmployee invoice={invoice} classes='rounded-lg border-2 border-primary-50-950'/>
                  {#if !invoice.paymentRecordNum}
                     <a href="/paymentRecords/new?userId={invoice.customerId}" class="btn preset-filled-primary-50-950">Make a payment Record for this invoice</a>
                  {/if}
                  {#if paymentRecord}
                  <PaymentRecordEmployee paymentRecord={paymentRecord} classes='rounded-lg border-2 border-primary-50-950'/>
                  {:else}
                  <div class="min-w-1/3"></div>
                  {/if}
                  {#if refund}
                  <RefundRecordDisplay refundRecord={refund} classes='rounded-lg border-2 border-primary-50-950 min-h-72'/>
                  {:else}
                  <div class="min-w-1/3"></div>
                  {/if}
                  {/each}
               </div>
               {:else}
               <div class="grid grid-cols-1 md:grid-cols-2 gap-x-1 gap-y-3 mx-2">
                  {#each slicedInvoices(invoices) as invoice}
                  {@const paymentRecord = paymentRecords.find((payment) => payment.invoiceNum === invoice.invoiceNum)}
                  <div class="rounded-lg border-2 border-primary-50-950">
                     <InvoiceEmployee invoice={invoice} classes=''/>
                     {#if !invoice.paymentRecordNum}
                        <a href="/paymentRecords/new?invoiceNum={invoice.invoiceNum}" class="btn preset-filled-primary-50-950 h-8 w-fit m-2">Make a payment Record for this invoice</a>
                     {/if}
                  </div>
               {#if paymentRecord}
                  <PaymentRecordEmployee paymentRecord={paymentRecord} classes='rounded-lg border-2 border-primary-50-950'/>
               {:else}
                  <div></div>
               {/if}
            {/each}
            </div>
         {/if}
         <Pagination bind:pageNum={pageNum} bind:size={size} label='invoices' array={invoices} />
      {/await}
   {/await}
{/await}    
</div>