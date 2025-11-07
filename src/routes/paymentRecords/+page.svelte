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
   import { goto, onNavigate } from '$app/navigation';
   import ProgressLine from '$lib/displayComponents/ProgressLine.svelte';
   import ProgressRing from '$lib/displayComponents/ProgressRing.svelte';
   import Combobox from '$lib/formComponents/Combobox.svelte';
   import FormModal from '$lib/displayComponents/Modals/FormModal.svelte';
	import EmailCustomer from '$lib/EmailCustomer.svelte';
	import DownloadPdfButton from '$lib/DownloadPDFButton.svelte';
	import SearchDrawer from '$lib/displayComponents/Modals/SearchDrawer.svelte';
	import { onMount } from 'svelte';
	import DateSearchForm from '$lib/forms/DateSearchForm.svelte';
	import RevenueBar from '$lib/displayComponents/RevenueBar.svelte';

   dayjs.extend(utc);
   
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
   const numberFormatter = new Intl.NumberFormat('en-US');
   const earliestDate = $derived((paymentRecords:PaymentRecord[]) => {
      let returnedDate = new Date();
      for(const paymentRecord of paymentRecords){
         if(paymentRecord.paymentCreated < returnedDate){
            returnedDate = paymentRecord.paymentCreated;
         }
      }
      return returnedDate
   })
   let slicedSource = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.slice((pageNum -1) * size, pageNum*size));
   let searchedPayments = $derived((paymentRecords:PaymentRecord[]) => {
      const returnedPayments = paymentRecords.filter((paymentRecord) => paymentRecord.paymentNumber.toString().includes(search))
      return returnedPayments;
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
   let dateSearchPayments = $derived((paymentRecords:PaymentRecord[]) => {
      const returnedPayments = paymentRecords.filter((paymentRecord) => {
         if(!startDate || !endDate){
            return paymentRecord
         }
         return paymentRecord.paymentCreated >= startDate && paymentRecord.paymentCreated <= endDate;
      });
      return returnedPayments;
   })
   let nameSearch = $state('');
   let currentUsers = $derived((users:User[]) => users.filter((user) => {
      return user.givenName?.toLowerCase().includes(nameSearch.toLowerCase()) 
      || user.familyName?.toLowerCase().includes(nameSearch.toLowerCase()) 
      || user.organizationName?.toLowerCase().includes(nameSearch.toLowerCase())
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
   interface ComboboxData {
      label: string;
      value: string;
   }
   let yearComboboxData:ComboboxData[] | undefined = $derived(data.years?.map(year => ({
      label: year.toString(),
      value: year.toString()
   })))
   let searchDrawerOpen = $state(false);
   let navDelayed = $state(false);
   let navTimeout = $state(false);
   onNavigate(() => {
      searchDrawerOpen = false;
      navDelayed = false;
      navTimeout = false;
   })
   onMount(() => {
      
   })
</script>
<FormModal
   modalOpen={modalOpen}
>  
{#snippet content()}
   <RefundForm data={data.refundForm} paymentRecord={currentPaymentRecord}/>
{/snippet}
</FormModal>
<Header title='Payment Records' />
{#if data.paymentRecordCount}
   {#await data.paymentRecords}
      <div class="mx-1 sm:mx-2 mt-10 sm:mt-10 mb-8">
         Loading {numberFormatter.format(data.paymentRecordCount)} payment records,
            <div class="flex flex-row">
               {#if yearComboboxData}                  
                  <Combobox
                     data={yearComboboxData}
                     label='or select year'
                     placeholder='Select year ...'
                     onValueChange={(details) => {
                        setTimeout(() => {
                           navDelayed = true;
                        }, 300)
                        goto(`/paymentRecords/year/${details.value[0]}`)
                     }}
                  />
                  {#if navDelayed}
                     <ProgressRing  
                        value={null} 
                        {@attach () => {
                           setTimeout(() => {
                              navDelayed = false;
                              navTimeout = true;
                           }, 800)
                        }}
                     />
                  {/if}
                  {#if navTimeout}
                     <ProgressLine 
                        value={null}
                     />
                  {/if}
               {/if}
            </div>
         <Placeholder numCols={1} numRows={size} heightClass='h-64' classes='z-0'/>
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
               <RevenueBar>
                  {#snippet content()}                     
                  <Revenue 
                     label="Total revenue" 
                     amount={totalRevenue(searchedPayments(searchByUser(paymentRecords, currentUsers(customers))))} 
                     classes='m-1 sm:m-2'    
                  />
                  <Revenue
                     label='Non-deposit revenue'
                     amount={totalRevenue(nonDeposits(searchedPayments(searchByUser(paymentRecords, currentUsers(customers)))))}
                     classes='m-1 sm:m-2'
                  />
                  {/snippet}
               </RevenueBar>
               <SearchDrawer
                  modalOpen={searchDrawerOpen}
                  height='h-[360px] lg:h-[130px]'
               >
               {#snippet content()}
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
                     <DateSearchForm
                        bind:startDate={startDate} 
                        bind:endDate={endDate} 
                        {minDate} 
                        {maxDate} 
                        data={data.dateSearchForm}
                        classes='flex flex-col sm:flex-row'    
                        {@attach () => {
                           startDate = earliestDate(paymentRecords);
                           minDate = earliestDate(paymentRecords);
                        }}
                     />
                     <button 
                        onclick={()=>{
                           sortBy = !sortBy;
                           searchDrawerOpen = false;
                        }} 
                        class="btn preset-filled-primary-50-950 m-2 h-8"
                     >Sort by date {sortBy ? 'starting earliest' : 'starting latest'}</button>
               {/snippet}
               </SearchDrawer>
                  <div class="mt-34 sm:mt-22 mb-8" in:fade={{duration:600}} out:fade={{duration:0}}>
                     {#each slicedSource(sortedByDate(searchedPayments(searchByUser(paymentRecords, currentUsers(customers))))) as paymentRecord}
                     {@const customer = customers.find((customer) => customer.id === paymentRecord.customerId) }
                        <div class="rounded-lg border border-primary-50-950 grid sm:grid-cols-2 m-2">
                           <div class="flex flex-col">
                              <PaymentRecordEmployee paymentRecord={paymentRecord} classes="p-2" />
                              <div class="flex flex-col sm:flex-row">
                                 {#if paymentRecord.refundedAmount < paymentRecord.paymentAmount}
                                    <button type="button" class="btn rounded-lg preset-filled-primary-50-950 h-8 w-50 m-2 sm:mx-2" onclick={() => refundModal(paymentRecord)}>Refund this payment</button>
                                 {/if}
                                 {#if customer?.email && customer.emailVerified}
                                    <EmailCustomer
                                       emailAddress={customer.email}
                                       recordNum={paymentRecord.paymentNumber}
                                       apiEndPoint='/api/sendReceipt'
                                       buttonText='Email receipt'
                                       classes='mx-2 sm:m-auto h-8'
                                    />
                                 {/if}
                                 <DownloadPdfButton
                                    recordType='paymentNum'
                                    num={paymentRecord.paymentNumber}
                                    classes='m-2 sm:mb-2 sm:mx-2'
                                 />
                              </div>
                           </div>
                           {#if customer}
                           {@const address = addresses.find((address)=> address.userId === customer.id)}
                              <div class="flex flex-col mx-2 mb-2">
                                 <UserEmployee user={customer} classes='truncate'/>
                                 {#if address}
                                    <Address {address} classes=''/>
                                 {/if}

                              </div>
                           {/if}
                        </div>
                     {/each}
                     <Pagination bind:size={size} bind:pageNum={pageNum} array={searchedPayments(searchByUser(paymentRecords, currentUsers(customers)))} label='payment records'/>
                  </div>
            {:else}
               No payment records from that year
            {/if}
         {/await}
      {/await}
   {/await}
{:else}
   {#await data.customer}
      <div class="mt-32 sm:mt-20 mb-20 sm:mb-12 lg:mb-8">
         Loading customer...
      </div>
   {:then customer} 
      {#await data.address}
         <div class="mt-32 sm:mt-20 mb-20 sm:mb-12 lg:mb-8">
            Loading address...
         </div>
      {:then address} 
         {#await data.paymentRecords}
            <div class="mt-20 sm:mt-10 mb-20 sm:mb-12 lg:mb-8">
               Loading payment records...
            </div>
         {:then paymentRecords} 
            <div class="mt-20 sm:mt-10 mb-20 sm:mb-12 lg:mb-8">
               
               {#each slicedSource(sortedByDate(dateSearchPayments(searchedPayments(paymentRecords)))) as paymentRecord}
                  <div class="rounded-lg border border-primary-50-950 grid sm:grid-cols-2 m-2">
                     <div class="flex flex-col">
                        <PaymentRecordEmployee paymentRecord={paymentRecord} classes="p-2" />
                        <div class="flex flex-col sm:flex-row">
                           {#if paymentRecord.refundedAmount < paymentRecord.paymentAmount}
                                 <button type="button" class="btn rounded-lg preset-filled-primary-50-950 h-8 w-50 m-2 sm:mx-2" onclick={() => refundModal(paymentRecord)}>Refund this payment</button>
                           {/if}
                           {#if customer?.email && customer.emailVerified}
                              <EmailCustomer
                                 emailAddress={customer.email}
                                 recordNum={paymentRecord.paymentNumber}
                                 apiEndPoint='/api/sendReceipt'
                                 buttonText='Email receipt'
                                 classes='mx-2 sm:m-auto h-8'
                              />
                           {/if}
                           <DownloadPdfButton
                              recordType='paymentNum'
                              num={paymentRecord.paymentNumber}
                              classes='m-2 sm:mb-2 sm:mx-2'
                           />
                        </div>
                     </div>
                     <div class="flex flex-col mx-2 mb-2">
                        {#if customer}
                           <UserEmployee user={customer} classes='truncate'/>
                        {/if}
                        {#if address}
                           <Address {address} classes=''/>
                        {/if}
                     </div>
                  </div>
               {/each}
               <Pagination bind:size={size} bind:pageNum={pageNum} array={dateSearchPayments(searchedPayments(paymentRecords))} label='payment records'/>
            </div>
         {/await}
      {/await}
   {/await}
{/if}