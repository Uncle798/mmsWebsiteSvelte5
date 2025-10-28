<script lang="ts">
   import Address from '$lib/displayComponents/AddressEmployee.svelte';
   import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
   import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import AddressForm from '$lib/forms/AddressForm.svelte';
   import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
   import type { PageData } from './$types';
   import LeaseEndForm from '$lib/forms/LeaseEndForm.svelte';
   import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
   import Header from '$lib/Header.svelte';
   import type { Invoice, PaymentRecord, User } from '@prisma/client';
	import RefundRecordDisplay from '$lib/displayComponents/RefundRecordEmployee.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import EmailChangeForm from '$lib/forms/EmailChangeForm.svelte';
	import EmailVerificationForm from '$lib/forms/EmailVerificationForm.svelte';
	import UserNotesForm from '$lib/forms/UserNotesForm.svelte';
	import FormModal from '$lib/displayComponents/Modals/FormModal.svelte';
	import UserRevenue from '$lib/displayComponents/UserRevenue.svelte';

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
         if(invoice.amountPaid < invoice.invoiceAmount && invoice.invoiceDue < new Date()){
            returnedInvoices.push(invoice);
         }
      }
      return returnedInvoices;
   })
   const overDueInvoice = $derived((invoice:Invoice) =>{
      if(invoice.amountPaid < invoice.invoiceAmount){
         return invoice.invoiceAmount - invoice.amountPaid;
      } else {
         return 0;
      }
   })
   function leaseModal(leaseId:string) {
      currentLeaseId = leaseId;
      modalReason = 'leaseEnd';
      globalModalOpen = true;
   }
   let currentUser = $state<User>(data.dbUser);
   function emailChangeModal(user:User){
      modalReason='emailVerification'
      globalModalOpen=true
      currentUser=user
   }
</script>
<FormModal
   modalOpen={globalModalOpen}
>
   {#snippet content()}
      {#if modalReason === 'emailChange'}
         <EmailChangeForm data={data.emailChangeForm} bind:emailModalOpen={globalModalOpen} user={currentUser}/>
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
</FormModal>

{#if data.dbUser}
   <Header title='{data.dbUser.givenName} {data.dbUser.familyName}' />
   <div class="grid grid-cols-1 sm:grid-cols-2 mt-14 sm:mt-10 mx-1 sm:mx-2">
      <div class="gap-2">
         <UserEmployee user={data.dbUser} classes='mx-2' />
         <button class="btn preset-filled-primary-50-950 m-2" 
            onclick={() => emailChangeModal(data.dbUser) }
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
      </div>
      <div>
         <UserNotesForm user={data.dbUser} data={data.userNotesForm} />
      </div>
   </div>
{:else}
...loading user
{/if}
<div class="mx-1 sm:mx-2">
   {#if data.address}
      <Address address={data.address} classes=''/>
      <button class="btn preset-filled-primary-50-950"
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
</div>
{#await data.leases}
   <div class="mx-2">
      Loading leases...
   </div>
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
               <a href="/invoices/new?leaseId={lease.leaseId}" class="btn preset-filled-primary-50-950 m-2">Make an invoice for this lease</a>
            {/if}
         </div>
      {/each}
   </div>
{/await}
<div class="mb-9">
{#await data.invoices}
    <div class='mx-2'>
        Loading invoices...
    </div>
{:then invoices}
   {#await data.paymentRecords}
      <div class="mx-2">
         Loading payments...
      </div>
   {:then paymentRecords} 
      {#await data.refunds}
         <div class="mx-2">
            Loading refunds...
         </div>
      {:then refunds}
            <UserRevenue
               totalInvoiced={derivedTotalInvoiced(invoices)}
               totalPaid={derivedTotalPaid(paymentRecords)}
               overdueAmount={derivedTotalInvoiced(overDueInvoices(invoices))}
               customer={data.dbUser}
               classes='m-2'
            />

         {#if refunds.length > 0}
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-x-1 gap-y-3 mx-2 ">
               {#each slicedInvoices(invoices) as invoice}
               {@const paymentRecord = paymentRecords.find((payment) => payment.invoiceNum === invoice.invoiceNum)}
               {@const refund = refunds.find((refund) => refund.paymentRecordNum === paymentRecord?.paymentNumber)}
                  <InvoiceEmployee invoice={invoice} classes='rounded-lg border-2 border-primary-50-950'/>
                  {#if overDueInvoice(invoice) > 0 }
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
                     {#if overDueInvoice(invoice) > 0 }
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