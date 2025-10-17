<script lang="ts">
   import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
	import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';
   import type { PaymentRecord, User } from '@prisma/client';
	import RefundForm from '$lib/forms/NewRefundForm.svelte';
	import Search from '$lib/forms/Search.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import Revenue from '$lib/displayComponents/Revenue.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
	import { fade } from 'svelte/transition';
	import DownloadPdfButton from '$lib/DownloadPDFButton.svelte';
	import EmailCustomer from '$lib/EmailCustomer.svelte';
   import FormModal from '$lib/displayComponents/Modals/FormModal.svelte';
	import SearchDrawer from '$lib/displayComponents/Modals/SearchDrawer.svelte';
   interface Props {
      data: PageData;
   }
   let { 
      data, 
   }: Props = $props();
   let refundModalOpen=$state(false); 
   let pageNum = $state(1);
   let size = $state(25);
   let search = $state('');
   let noteSearch = $state('');
   const numberFormatter = new Intl.NumberFormat('en-US');
   const slicedSource = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.slice((pageNum -1) * size, pageNum*size));
   const searchedPaymentRecords = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.filter((paymentRecord) => paymentRecord.paymentNumber.toString().includes(search))) 
   const searchByNotes = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.filter((paymentRecord) => paymentRecord.paymentNotes?.includes(noteSearch)));
   let paymentRecord=$state<PaymentRecord>({} as PaymentRecord);
   function refundModal(deposit:PaymentRecord) {
      paymentRecord = deposit;
      refundModalOpen = true;
   }
   let totalRevenue = $derived((paymentRecords:PaymentRecord[]) => {
      let totalRevenue = 0;
      paymentRecords.forEach((paymentRecord) => {
         totalRevenue += paymentRecord.paymentAmount - paymentRecord.refundedAmount
      })
      return totalRevenue;
   })

   let nameSearch = $state('');
   let currentUsers = $derived((users:User[]) => users.filter((user) => {
      return user.givenName?.toLowerCase().includes(nameSearch.toLowerCase()) 
      || user.familyName?.toLowerCase().includes(nameSearch.toLowerCase()) 
      || user.organizationName?.toLowerCase().includes(nameSearch.toLowerCase());
   }))
   const searchByUser = $derived((paymentRecords:PaymentRecord[], customers:User[]) => {
      const users = currentUsers(customers);
      const records:PaymentRecord[] = []
      users.forEach((user) => {
         const userRecords = paymentRecords.filter((paymentRecord) => {
            return paymentRecord.customerId === user.id
         })
         userRecords.forEach((record) => {
            records.push(record);
         })
      })
      return records
   })
   let searchDrawerOpen = $state(false);
   let sortBy = $state(false);
   let explainerModalOpen=$state(false);
   let sortedByDate = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.sort((a,b) => {
      if(a.paymentCreated > b.paymentCreated){
         if(sortBy){
            return -1
         }
         return 1
      }
      if(a.paymentCreated < b.paymentCreated){
         if(sortBy){
            return 1
         }
         return -1
      }
      return 0
   }))
</script>
<Header title='Deposits' />
<FormModal
   modalOpen={refundModalOpen}
>
   {#snippet content()}
      <RefundForm data={data.refundForm} paymentRecord={paymentRecord}/>
   {/snippet}
</FormModal>
{#await data.deposits}
    <div class="mt-14 sm:mt-10 m-1 sm:m-2">
        Loading {numberFormatter.format(data.depositCount)} deposits
    </div>
{:then deposits} 
   {#await data.customers}
      <div class="mt-14 sm:mt-10 m-1 sm:m-2">
         Loading customers...
      </div>
   {:then customers} 
      {#await data.addresses}
         <div class="mt-14 sm:mt-10 m-1 sm:m-2">
               Loading addresses...
         </div>
      {:then addresses} 
         <Revenue amount={totalRevenue(searchedPaymentRecords(deposits))} label='Amount of deposits' classes='bg-tertiary-50-950 w-screen rounded-b-lg fixed top-10 sm:top-8 p-2 z-0' />
         <SearchDrawer
            modalOpen={searchDrawerOpen}
            height='h-[180px]'
         >
            {#snippet content()}
               <div class="flex flex-col sm:flex-row gap-2" >
                  <Search 
                     bind:search={search} 
                     searchType='payment record number' 
                     data={data.searchForm}
                  />
                  <Search
                     bind:search={nameSearch}
                     searchType='customer name'
                     data={data.searchForm}
                  />
                  <Search
                     bind:search={noteSearch}
                     searchType='payment notes'
                     data={data.searchForm}
                  />
               </div>
               <button 
                  onclick={()=>{
                     sortBy = !sortBy;
                     searchDrawerOpen = false;
                  }} 
                  class="btn preset-filled-primary-50-950 m-2"
               >Sort by date {sortBy ? 'starting earliest' : 'starting latest'}</button>
            {/snippet}
         </SearchDrawer>
         <div class="flex flex-col gap-2 mt-20 mb-8" in:fade={{duration:600}} out:fade={{duration:0}}>
            {#each slicedSource(sortedByDate(searchedPaymentRecords(searchByNotes(searchByUser(deposits, customers))))) as deposit}
            {@const user = customers.find((customer) => customer.id === deposit.customerId)}
               <div class="flex flex-col sm:flex-row border-2 border-primary-50-950 rounded-lg mx-1 sm:mx-2 gap-2">
                  <div class="w-2/3">
                     <PaymentRecordEmployee paymentRecord={deposit} classes=''/>
                     <div class="flex flex-col sm:flex-row gap-2 m-2">
                        <button type="button" class="btn rounded-lg preset-filled-primary-50-950 h-8" onclick={() => refundModal(deposit)}>Refund this deposit</button>
                        <DownloadPdfButton
                           recordType='paymentNum'
                           num={deposit.paymentNumber}
                        />
                        {#if user?.email && user.emailVerified}
                           <EmailCustomer
                              apiEndPoint='/api/sendReceipt'
                              emailAddress={user.email}
                              recordNum={deposit.paymentNumber}
                              buttonText='Email Receipt'
                           />
                        {/if}
                     </div>
                  </div>
                  <div>
                     {#if user}
                     {@const address = addresses.find((address) => address.userId === user.id)}
                        <UserEmployee {user} />
                        {#if address}
                           <AddressEmployee {address} />
                        {/if}
                     {/if}
                  </div>
               </div>
            {/each}
            <Pagination pageNum={pageNum} size={size} array={searchedPaymentRecords(searchByNotes(searchByUser(deposits, customers)))} label='invoices' classes='col-span-full' />
         </div>
      {/await}
   {/await}
{/await}