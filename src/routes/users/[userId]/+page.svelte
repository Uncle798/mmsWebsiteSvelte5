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
   import type { Invoice, PaymentRecord, User } from '../../../generated/prisma/browser';
	import RefundRecordDisplay from '$lib/displayComponents/RefundRecordEmployee.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import EmailChangeForm from '$lib/forms/EmailChangeForm.svelte';
	import EmailVerificationForm from '$lib/forms/EmailVerificationForm.svelte';
	import UserNotesForm from '$lib/forms/UserNotesForm.svelte';
	import FormModal from '$lib/displayComponents/Modals/FormModal.svelte';
	import UserRevenue from '$lib/displayComponents/UserRevenue.svelte';
	import NameChangeForm from '$lib/forms/NameChangeForm.svelte';
	import OnboardingCreateManyInvoicesForm from '$lib/forms/OnboardingCreateManyInvoicesForm.svelte';
	import Button from '$lib/core/Button.svelte';
	import type { Lease } from '../../../generated/prisma/client';
	import PayManyInvoicesForm from '$lib/forms/PayManyInvoicesForm.svelte';
	import { Accordion } from '@skeletonlabs/skeleton-svelte';
	import NewInvoiceForm from '$lib/forms/NewInvoiceForm.svelte';
	import NewPaymentRecordForm from '$lib/forms/NewPaymentRecordForm.svelte';

   let { data }: { data: PageData } = $props();
   let globalModalOpen = $state(false);
   let modalReason = $state('');
   let currentLeaseId = $state('');
   let pageNum = $state(1);
   let size = $state(5);
   const slicedInvoices = $derived((invoices:Invoice[]) => invoices.slice((pageNum - 1) * size, pageNum * size));
   const derivedTotalInvoiced = $derived((invoices:Invoice[]) => {
      let total = 0;
      for(const invoice of invoices){
         if(!invoice.deposit){
            total += invoice.invoiceAmount;
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
      let totalOverdue = 0;
      for(const invoice of invoices){
         if(invoice.amountPaid < invoice.invoiceAmount && invoice.invoiceDue < new Date()){
            totalOverdue += invoice.invoiceAmount - invoice.amountPaid;
         }
      }
      return totalOverdue;
   });
   const overDueInvoice = $derived((invoice:Invoice) =>{
      if(invoice.amountPaid < invoice.invoiceAmount){
         return invoice.invoiceAmount - invoice.amountPaid;
      } else {
         return 0;
      }
   });
   function leaseModal(leaseId:string) {
      currentLeaseId = leaseId;
      modalReason = 'leaseEnd';
      globalModalOpen = true;
   }
   let currentUser = $state<User>(data.dbUser);
   function emailChangeModal(user:User){
      modalReason='emailChange'
      globalModalOpen=true
      currentUser=user
   }
   let currentLease = $state<Lease>();
   let currentInvoice = $state<Invoice>()
</script>
<FormModal
   bind:modalOpen={globalModalOpen}
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
      {:else if modalReason === 'nameChange'}
         <NameChangeForm
            data={data.nameChangeForm}
            userId={data.userId}
            bind:nameModalOpen={globalModalOpen}
         />
      {:else if modalReason === 'onboardingCreateManyInvoices' && currentLease}
         <OnboardingCreateManyInvoicesForm 
            data={data.onboardingCreateManyInvoicesForm} 
            lease={currentLease} 
            bind:modalOpen={globalModalOpen} 
         />
      {:else if modalReason === 'payManyInvoices'}
         <PayManyInvoicesForm
            data={data.payManyInvoicesForm}
            customerId={data.userId}
            bind:modalOpen={globalModalOpen}
         />
      {:else if modalReason === 'newInvoice'}
         <NewInvoiceForm
            data={data.newInvoiceForm}
            employeeId={data.user!.id}
            emailVerificationFormData={data.emailVerificationForm}
            registerFormData={data.registerForm}
            lease={currentLease}
            customer={data.dbUser}
            bind:modalOpen={globalModalOpen}
         />
      {:else if modalReason === 'newPayment'}
         <NewPaymentRecordForm
            data={data.newPaymentRecordForm}
            invoiceFormData={data.newInvoiceForm}
            registerFormData={data.registerForm}
            emailVerificationFormData={data.emailVerificationForm}
            employeeId={data.user!.id}
            invoice={currentInvoice}
            customer={data.dbUser}
            bind:modalOpen={globalModalOpen}
         />
      {/if}
   {/snippet}
</FormModal>

{#if data.dbUser}
   <Header title='{data.dbUser.givenName} {data.dbUser.familyName}' />
   <div class="grid grid-cols-1 sm:grid-cols-2 mt-14 sm:mt-10 mx-1 sm:mx-2">
      <div class="gap-2">
         <UserEmployee user={data.dbUser} classes='mx-2' />
         <Button
            label='Change email address'
            type='button'
            onClick={() => {
               emailChangeModal(data.dbUser)
            }}
         />
         {#if !data.dbUser.emailVerified}
            <Button
               label='Verify email address'
               type='button'
               onClick={() => {
                  modalReason='emailVerify';
                  globalModalOpen=true;
               }}
            />
         {/if}
         <Button
            label='Change name'
            type='button'
            onClick={() => {
               modalReason='nameChange'
               globalModalOpen=true
            }}
         />
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
      <Button
         type='button'
         label='Change address'
         onClick={() => {
            modalReason='addressChange';
            globalModalOpen=true;
         }}
      />
   {:else}
         <Button
            type='button'
            label='Add address'
            onClick={() => {
               modalReason='addressChange';
               globalModalOpen=true;
            }}
         />
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
               <div class="m-2 gap-2 flex flex-col">
                  <Button
                     label='End lease'
                     type='button'
                     onClick={() => leaseModal(lease.leaseId)}
                  />
                  <Button
                     label='Make an invoice for this lease'
                     type='button'
                     onClick={() => {
                        modalReason='newInvoice';
                        currentLease=lease;
                        globalModalOpen=true;
                     }}
                  />
                  <Button
                     label='Create many invoices for this lease'
                     type='button'
                     onClick={() => {
                        modalReason='onboardingCreateManyInvoices'
                        currentLease = lease;
                        globalModalOpen = true;
                     }}
                  />
               </div>
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
            overdueAmount={overDueInvoices(invoices)}
            customer={data.dbUser}
            classes='m-2'
         />
         {#if refunds.length > 0}
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-x-1 gap-y-3 mx-2 ">
               {#each slicedInvoices(invoices) as invoice}
               {@const invoicePaymentRecords = paymentRecords.filter((payment) => payment.invoiceNum === invoice.invoiceNum)}
                  <InvoiceEmployee invoice={invoice} classes='rounded-lg border-2 border-primary-50-950'/>
                  {#if overDueInvoice(invoice) > 0 }
                     <Button
                        label='Make a payment record for invoice {invoice.invoiceNum}'
                        type='button'
                        onClick={() => {
                           currentInvoice=invoice;
                           modalReason='newPayment';
                           globalModalOpen=true;
                        }}
                     />
                  {/if}
                  {#each invoicePaymentRecords as paymentRecord (paymentRecord.paymentNumber)}
                     <PaymentRecordEmployee paymentRecord={paymentRecord} classes='rounded-lg border-2 border-primary-50-950'/>
                  {/each}
               {/each}
            </div>
         {:else}
               <Button
                  type='button'
                  label='Take a payment'
                  onClick={() => {
                     modalReason='payManyInvoices';
                     globalModalOpen=true;
                  }}
                  classes='m-2'
               />
            <div class="mx-2">
               {#each slicedInvoices(invoices) as invoice}
               {@const invoicePaymentRecords = paymentRecords.filter((payment) => payment.invoiceNum === invoice.invoiceNum)}
                  <div>
                     <InvoiceEmployee invoice={invoice} classes=''/>
                     {#if overDueInvoice(invoice) > 0 }
                        <Button
                           label='Make a payment record for invoice {invoice.invoiceNum}'
                           type='button'
                           onClick={() => {
                              currentInvoice=invoice;
                              modalReason='newPayment';
                              globalModalOpen=true;
                           }}
                        />
                     {/if}
                     <Accordion multiple>
                        {#each invoicePaymentRecords as paymentRecord (paymentRecord.paymentNumber)}
                           <Accordion.Item value={paymentRecord.paymentNumber.toString()} >
                              <Accordion.ItemTrigger>
                                 Payment record {paymentRecord.paymentNumber}
                              </Accordion.ItemTrigger>
                              <Accordion.ItemContent>
                                 <PaymentRecordEmployee paymentRecord={paymentRecord} classes='rounded-lg border-2 border-primary-50-950'/>
                              </Accordion.ItemContent>
                           </Accordion.Item>
                        {/each}      
                     </Accordion>
                  </div>
               {/each}
            </div>
         {/if}
         {#if invoices.length > size}
            <Pagination bind:pageNum={pageNum} bind:size={size} label='invoices' array={invoices} />
         {/if}
      {/await}
   {/await}
{/await}    
</div>