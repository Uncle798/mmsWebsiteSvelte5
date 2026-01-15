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
	import { Accordion, Menu, Portal } from '@skeletonlabs/skeleton-svelte';
	import NewInvoiceForm from '$lib/forms/NewInvoiceForm.svelte';
	import NewPaymentRecordForm from '$lib/forms/NewPaymentRecordForm.svelte';
	import { PUBLIC_COMPANY_NAME } from '$env/static/public';
	import SearchDrawer from '$lib/displayComponents/Modals/SearchDrawer.svelte'; 
	import Combobox from '$lib/formComponents/Combobox.svelte';
	import { goto } from '$app/navigation';
	import { MenuIcon } from 'lucide-svelte';
	import { humanUnitNum } from '$lib/utils/humanUnitNum';

   let { data }: { data: PageData } = $props();
   let modalOpen = $state(false);
   let modalReason = $state('');
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
   function emailChangeModal(){
      modalReason='emailChange'
      modalOpen=true;
   }
   let currentLease = $state<Lease>();
   let currentInvoice = $state<Invoice>();
   const selectedInvoices = $state<Invoice[]>([]);
   const isInvoiceSelected = $derived((invoice:Invoice) => {
      const selected = selectedInvoices.find((inv) => inv.invoiceNum === invoice.invoiceNum)
      if(selected){
         return true
      } else {
         return undefined
      }
   })
   const comboboxData = $derived(data.customers.map((customer) => {
      return {
         label: customer.organizationName ? customer.organizationName : `${customer.givenName} ${customer.familyName}`,
         value: customer.id
      }
   }));
   let searchDrawerOpen = $state(false);
</script>
<FormModal
   bind:modalOpen={modalOpen}
>
   {#snippet content()}
      {#if modalReason === 'emailChange'}
         <EmailChangeForm data={data.emailChangeForm} bind:emailModalOpen={modalOpen} user={data.dbUser}/>
      {:else if modalReason === 'emailVerification'}
         <EmailVerificationForm 
            data={data.emailVerificationForm}
            userId={data.dbUser.id}
            bind:emailVerificationModalOpen={modalOpen}
            redirect='false'
         />
      {:else if modalReason === 'addressChange'}
         <AddressForm
            data={data.addressForm}
            userId={data.dbUser.id}
            bind:addressModalOpen={modalOpen}
         />
      {:else if modalReason === 'endLease'}
         <LeaseEndForm
            data={data.leaseEndForm}
            bind:leaseEndModalOpen={modalOpen}
            leaseId={currentLease!.leaseId}
         />
      {:else if modalReason === 'nameChange'}
         <NameChangeForm
            data={data.nameChangeForm}
            userId={data.userId}
            bind:nameModalOpen={modalOpen}
         />
      {:else if modalReason === 'manyInvoices' && currentLease}
         <OnboardingCreateManyInvoicesForm 
            data={data.onboardingCreateManyInvoicesForm} 
            lease={currentLease} 
            bind:modalOpen={modalOpen} 
         />
      {:else if modalReason === 'payManyInvoices'}
         <PayManyInvoicesForm
            data={data.payManyInvoicesForm}
            customerId={data.userId}
            bind:modalOpen={modalOpen}
         />
      {:else if modalReason === 'newInvoice'}
         <NewInvoiceForm
            data={data.newInvoiceForm}
            employeeId={data.user!.id}
            emailVerificationFormData={data.emailVerificationForm}
            registerFormData={data.registerForm}
            lease={currentLease}
            customer={data.dbUser}
            bind:modalOpen={modalOpen}
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
            bind:modalOpen={modalOpen}
         />
      {/if}
   {/snippet}
</FormModal>
<SearchDrawer
   bind:modalOpen={searchDrawerOpen}
   height='h-[120px]'
>
   {#snippet content()}
      <Combobox
         data={comboboxData}
         label='Search customers'
         onValueChange={(e) => {
            searchDrawerOpen = false;
            goto(`/users/${e.value[0]}`);
         }}
      />
   {/snippet}
</SearchDrawer>

{#if data.dbUser}
   <Header title={ data.dbUser.organizationName ? data.dbUser.organizationName : `${data.dbUser.givenName} ${data.dbUser.familyName}`} />
   <div class="relative mt-12 sm:mt-10 mx-2 sm:mx-2 border-2 rounded-lg border-primary-50-950">
      <UserEmployee user={data.dbUser} classes='ml-18'/>
         <Menu
            onSelect={(d) => {
               switch (d.value) {
                  case 'emailChange':
                     emailChangeModal()
                     break;
                  default:
                     modalReason = d.value;
                     modalOpen = true;
                     break;
               }
            }}
         >
            <Menu.Trigger class='btn preset-filled-primary-50-950 absolute top-10 left-82'><MenuIcon class='size-6' aria-label='User menu' /></Menu.Trigger>
            <Portal>
               <Menu.Positioner>
                  <Menu.Content>
                     <Menu.Item value='emailChange'>
                        <Menu.ItemText>Change email address</Menu.ItemText>
                     </Menu.Item>
                     <Menu.Item value='emailVerify'>
                        <Menu.ItemText>Verify email address</Menu.ItemText>
                     </Menu.Item>
                     <Menu.Item value='nameChange'>
                        <Menu.ItemText>Change Name</Menu.ItemText>
                     </Menu.Item>
                  </Menu.Content>
               </Menu.Positioner>
            </Portal>
         </Menu>
      <UserNotesForm user={data.dbUser} data={data.userNotesForm} classes='m-2'/>
   </div>
{:else}
...loading user
{/if}
<div class="mx-2 relative">
   {#if data.address}
      <Address address={data.address} classes=''/>
      <Button
         type='button'
         label='Change address'
         onClick={() => {
            modalReason='addressChange';
            modalOpen=true;
         }}
      />
   {:else}
         <Button
            type='button'
            label='Add address'
            onClick={() => {
               modalReason='addressChange';
               modalOpen=true;
            }}
         />
   {/if}
</div>
{#await data.leases}
   <div class="mx-2">
      Loading leases...
   </div>
{:then leases}
   <div class=" columns-2">
      {#each leases as lease}
         <div class="rounded-lg border-2 border-primary-50-950 flex flex-col m-2 relative">
            <LeaseEmployee lease={lease} classes='m-2' open={true} />
            <Menu
               onSelect={(e) => {
                  switch (e.value) {
                     default:
                        modalReason = e.value;
                        currentLease = lease;
                        modalOpen = true;
                        break;
                  }
               }}
            >
               <Menu.Trigger class='btn preset-filled-primary-50-950 absolute top-2 left-2'><MenuIcon aria-label='Lease menu unit number {humanUnitNum(lease.unitNum)}'/></Menu.Trigger>
               <Portal>
                  <Menu.Positioner>
                     <Menu.Content>
                        <Menu.Item value='endLease' disabled={lease.leaseEnded ? true : undefined}>
                           <Menu.ItemText>End lease</Menu.ItemText>
                        </Menu.Item>
                        <Menu.Item value='newInvoice' disabled={lease.leaseEnded ? true : undefined}>
                           <Menu.ItemText>Make single invoice for this lease</Menu.ItemText>
                        </Menu.Item>
                        <Menu.Item value='manyInvoices' disabled={lease.leaseEnded ? true : undefined}>
                           <Menu.ItemText>Create many invoices for this lease</Menu.ItemText>
                        </Menu.Item>
                     </Menu.Content>
                  </Menu.Positioner>
               </Portal>
            </Menu>
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
         <div class="flex flex-col sm:flex-row gap-2 m-2">
            <label for="selectAllInovices" class="label-text">Select all invoices
               <input 
                  type="checkbox" 
                  name="selectAllInvoices" 
                  class="input checkbox"
                  onchange={(e) => {
                     if(e.currentTarget.checked){
                        for(const invoice of invoices){
                           const alreadyThere = selectedInvoices.find((inv) => inv.invoiceNum === invoice.invoiceNum)
                           if(!alreadyThere){
                              selectedInvoices.push(invoice);
                           }
                        }
                     } else {
                        for(const invoice of invoices){
                           const index = selectedInvoices.map((inv) => inv.invoiceNum).indexOf(invoice.invoiceNum);
                           if(index > -1){
                              selectedInvoices.splice(index, 1);
                           }
                        }
                     }
                  }}
                  checked={selectedInvoices.length === invoices.length ? true : undefined}
               />
            </label>
            <Button
               type='button'
               label='Take a payment'
               onClick={() => {
                  modalReason='payManyInvoices';
                  modalOpen=true;
               }}
               classes=''
            />
            <Button
               type='button'
               label='Download PDF of selected invoices'
               onClick={async() => {
                  let url = '/api/downloadPDF?';
                  const invoiceNums:number[] = []
                  for(const invoice of selectedInvoices){
                     url += `invoiceNum=${invoice.invoiceNum}&`;
                     invoiceNums.push(invoice.invoiceNum);
                  }
                  const res = await fetch(url);
                  const blob = await res.blob();
                  url = URL.createObjectURL(blob);
                  let fileName = `${PUBLIC_COMPANY_NAME} invoices `;
                  for(const num of invoiceNums){
                     fileName += `${num} `
                  }
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = fileName
                  document.body.append(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url)
               }}
               disabled={selectedInvoices.length > 0 ? undefined : true}
            />
         </div>
         <div class="mx-2">
            {#each slicedInvoices(invoices) as invoice}
            {@const invoicePaymentRecords = paymentRecords.filter((payment) => payment.invoiceNum === invoice.invoiceNum)}
               <div class="flex flex-row">
                  <label for={invoice.invoiceNum.toString()} class="label-text mx-2 self-center">
                     Select {invoice.invoiceNum}
                     <input 
                        type="checkbox" 
                        group={selectedInvoices}
                        name={invoice.invoiceNum.toString()}
                        value={invoice.invoiceNum.toString()} 
                        class='input checkbox justify-self-center self-center'
                        onchange={(e) => {
                           if(e.currentTarget.checked){
                              selectedInvoices.push(invoice);
                           } else {
                              const index = selectedInvoices.map((inv) => inv.invoiceNum).indexOf(invoice.invoiceNum);
                              if(index > -1){
                                 selectedInvoices.splice(index, 1);
                              }
                           }
                        }}
                        checked={ isInvoiceSelected(invoice) }
                     />
                  </label>
                  <InvoiceEmployee invoice={invoice} classes='w-100'/>
                  {#if overDueInvoice(invoice) > 0 }
                     <Button
                        label='Make a payment record for invoice {invoice.invoiceNum}'
                        type='button'
                        onClick={() => {
                           currentInvoice=invoice;
                           modalReason='newPayment';
                           modalOpen=true;
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
         {#if invoices.length > size}
            <Pagination bind:pageNum={pageNum} bind:size={size} label='invoices' array={invoices} />
         {/if}
      {/await}
   {/await}
{/await}    
</div>