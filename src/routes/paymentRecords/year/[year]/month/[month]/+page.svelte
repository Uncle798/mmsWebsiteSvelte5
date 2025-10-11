<script lang="ts">
   import type { PageData } from './$types';
   import type { PaymentRecord, User } from '@prisma/client';
   import Header from '$lib/Header.svelte';
   import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
   import Pagination from '$lib/displayComponents/Pagination.svelte';
   import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
   import { fade } from 'svelte/transition';
   import Search from '$lib/forms/Search.svelte';
   import Placeholder from '$lib/displayComponents/Placeholder.svelte';
   import dayjs from 'dayjs';
   import utc from 'dayjs/plugin/utc'
   import DateSearch from '$lib/forms/DateSearch.svelte';
   import Revenue from '$lib/displayComponents/Revenue.svelte';  
   import Address from '$lib/displayComponents/AddressEmployee.svelte';
   import RefundForm from '$lib/forms/NewRefundForm.svelte'
	import { SearchIcon, PanelTopCloseIcon } from 'lucide-svelte';
	import EmailCustomer from '$lib/EmailCustomer.svelte';
	import DownloadPdfButton from '$lib/DownloadPDFButton.svelte';
	import FormModal from '$lib/displayComponents/Modals/FormModal.svelte';
	import SearchDrawer from '$lib/displayComponents/Modals/SearchDrawer.svelte';
   dayjs.extend(utc)
   let { data }: { data: PageData } = $props();
   let pageNum = $state(1);
   let size = $state(25);
   let search = $state('');
   let startDate = $state<Date>(new Date());
   let endDate = $state<Date>(new Date());
   let maxDate = $state<Date>();
   let minDate = $state<Date>();
   let modalOpen = $state(false);
   let sortBy = $state(false)
   let currentPaymentRecord = $state<PaymentRecord>({} as PaymentRecord)
   let nonDeposits = $derived((payments:PaymentRecord[]) =>{
      const returnedPayments:PaymentRecord[] = [];
      for(const payment of payments){
         if(!payment.deposit){
            returnedPayments.push(payment)
         }
      }
      return returnedPayments;
   });
   let wrapper = new Promise<PaymentRecord[]>(async res => {
      const paymentRecords = await data.paymentRecords
      if(paymentRecords.length > 0){
          startDate = dayjs.utc(paymentRecords[0].paymentCreated).startOf('year').toDate();
          minDate = startDate;
          endDate = dayjs.utc(paymentRecords[paymentRecords.length-1].paymentCreated).endOf('year').toDate();
          maxDate = endDate;
        }
        res(paymentRecords);
    })
   const numberFormatter = new Intl.NumberFormat('en-US');
   let slicedSource = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.slice((pageNum -1) * size, pageNum*size));
   let searchedPayments = $derived((paymentRecords:PaymentRecord[]) => {
      return paymentRecords.filter((paymentRecord) => paymentRecord.paymentNumber.toString().includes(search)) || paymentRecords.filter((paymentRecord) => paymentRecord.paymentNotes!.includes(search));
   })
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
   let dateSearchPayments = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.filter((paymentRecord) => {
      if(!startDate || !endDate){
         return
      }
      return paymentRecord.paymentCreated >= startDate && paymentRecord.paymentCreated <= endDate;
   }))
   let nameSearch = $state('');
   let currentUsers = $derived((users:User[]) => users.filter((user) => {
      return user.givenName?.toLowerCase().includes(nameSearch.toLowerCase()) || user.familyName?.toLowerCase().includes(nameSearch.toLowerCase()) || user.organizationName?.toLowerCase().includes(nameSearch.toLowerCase())
   }));
   const searchByUser = $derived((paymentRecords:PaymentRecord[], customers:User[]) => {
      const customerPayments:PaymentRecord[] = [];
      for(const customer of customers){
         const payments = paymentRecords.filter((paymentRecord) =>{
            return paymentRecord.customerId === customer.id;
         })
         for(const payment of payments){
            customerPayments.push(payment)
         }
      }
      return customerPayments;
   })
   let totalRevenue = $derived((paymentRecords:PaymentRecord[]) => {
      let totalRevenue = 0;
      for(const paymentRecord of paymentRecords){
         totalRevenue += paymentRecord.paymentAmount
      }
      return totalRevenue;
   })
   function refundModal(paymentRecord:PaymentRecord){
      currentPaymentRecord = paymentRecord;
      modalOpen = true
   }
   let searchDrawerOpen = $state(false);
</script>
<FormModal
   modalOpen={modalOpen}
>  
   {#snippet content()}
      <RefundForm data={data.refundForm} paymentRecord={currentPaymentRecord}/>
      <button class="btn rounded-lg preset-filled-primary-50-950" onclick={()=>modalOpen = false}>Close</button>
   {/snippet}
</FormModal>
<Header title='Payment Records' />
{#await wrapper}
   <div class="mx-1 sm:mx-2 mt-14 sm:mt-10">
      Loading {numberFormatter.format(data.paymentRecordCount)} payment records...
      <Placeholder numCols={1} numRows={size} heightClass='h-32' classes='z-0'/>
   </div>
{:then paymentRecords} 
   {#await data.customers}
      <div class="mt-14 sm:mt-10">
         Loading customers...
      </div>
   {:then customers} 
      {#await data.addresses}
         <div class="mt-14 sm:mt-10">
            Loading contacts...
         </div>
      {:then addresses}         
         {#if paymentRecords.length >0}
            <div class="bg-tertiary-50-950 w-screen rounded-b-lg fixed top-8 flex">
               <Revenue 
                  label="Total revenue" 
                  amount={totalRevenue(searchedPayments(dateSearchPayments(paymentRecords)))} 
                  classes='m-1 sm:m-2'    
               />
               <Revenue
                  label='Non-deposit revenue'
                  amount={totalRevenue(nonDeposits(paymentRecords))}
                  classes='m-1 sm:m-2'
               />
            </div>
            <SearchDrawer
               modalOpen={searchDrawerOpen}
               height='h-[180px]'
            >
               {#snippet content()}
                  <Search 
                     bind:search={search} 
                     searchType='payment record number' 
                     data={data.searchForm}
                     classes='m-1 sm:m-2 mt-11 sm:mt-11'
                  />
                  <Search
                     bind:search={nameSearch}
                     searchType='customer name'
                     data={data.searchForm}
                     classes='m-1 sm:m-2'
                  />
                  <DateSearch 
                     bind:startDate={startDate} 
                     bind:endDate={endDate} 
                     {minDate} 
                     {maxDate} 
                     data={data.dateSearchForm}
                     classes='flex flex-col md:grid md:grid-cols-2 m-1 sm:m-2'    
                  />
                  <button onclick={()=>{
                     sortBy = !sortBy;
                     searchDrawerOpen = false;
                     }} class="anchor col-span-full mx-2">Sort by date {sortBy ? 'starting earliest' : 'starting latest'}</button>
               {/snippet}
            </SearchDrawer>
               <div class="mt-26 sm:mt-20 mb-8" in:fade={{duration:600}} out:fade={{duration:0}}>
                  {#each slicedSource(dateSearchPayments(searchedPayments(sortedByDate(searchByUser(paymentRecords, currentUsers(customers)))))) as paymentRecord}
                  {@const customer = customers.find((customer) => customer.id === paymentRecord.customerId) }
                     <div class="rounded-lg border border-primary-50-950 grid sm:grid-cols-2 m-2">
                        <div>
                           <PaymentRecordEmployee paymentRecord={paymentRecord} classes="p-2" />
                           {#if paymentRecord.paymentAmount > paymentRecord.refundedAmount}
                                 <button type="button" class="btn rounded-lg preset-filled-primary-50-950 m-2" onclick={() => refundModal(paymentRecord)}>Refund this payment</button>
                           {/if}
                        </div>
                        {#if customer}
                        {@const address = addresses.find((address)=> address.userId === customer.id)}
                           <div class="flex flex-col mx-2 mb-2">
                              <UserEmployee user={customer} classes=''/>
                              {#if address}
                                 <Address {address} classes=''/>
                              {/if}
                              {#if customer.email && customer.emailVerified}
                                 <EmailCustomer
                                    emailAddress={customer.email}
                                    recordNum={paymentRecord.paymentNumber}
                                    apiEndPoint='/api/sendReceipt'
                                    buttonText='Email receipt'
                                 />
                              {/if}
                              <DownloadPdfButton
                                 recordType='paymentNum'
                                 num={paymentRecord.paymentNumber}
                              />
                           </div>
                        {/if}
                     </div>
                  {/each}
                  <Pagination bind:size={size} bind:pageNum={pageNum} array={dateSearchPayments(searchedPayments(searchByUser(paymentRecords, currentUsers(customers))))} label='payment records'/>
               </div>
         {:else}
            No payment records from that month
         {/if}
      {/await}
   {/await}
{/await}