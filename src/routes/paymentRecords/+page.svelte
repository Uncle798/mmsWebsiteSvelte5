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
   import { Combobox, Modal } from '@skeletonlabs/skeleton-svelte';
   import { goto } from '$app/navigation';
	import { SearchIcon, PanelTopCloseIcon } from 'lucide-svelte';
	import EmailCustomer from '$lib/emailCustomer.svelte';
	import { returns } from 'valibot';
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
      $inspect(startDate)
      $inspect(endDate)

      const returnedPayments = paymentRecords.filter((paymentRecord) => {
         if(!startDate || !endDate){
            return paymentRecord
         }
         return paymentRecord.paymentCreated >= startDate && paymentRecord.paymentCreated <= endDate;
      })
      console.log('dateSearchedPayments', returnedPayments);
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
   let yearSelect = $state(['']);
   interface ComboboxData {
      label: string;
      value: string;
   }
   let yearComboboxData:ComboboxData[] = [
      {label:'Unpaid Invoices', value: 'unpaid'},
   ]
   data.years.forEach((year) => {
      yearComboboxData.push({label:year.toString(), value: year.toString()})
   })
   let searchDrawerOpen = $state(false);
</script>
<Modal
   open={modalOpen}
   onOpenChange={(e) => modalOpen = e.open}
   contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl"
   backdropClasses=""
   modal={true}
>  
{#snippet content()}
   <RefundForm data={data.refundForm} paymentRecord={currentPaymentRecord}/>
   <button class="btn rounded-lg preset-filled-primary-50-950" onclick={()=>modalOpen = false}>Close</button>
{/snippet}

</Modal>
<Header title='Payment Records' />
{#await wrapper}
   <div class="mx-1 sm:mx-2 mt-14 sm:mt-14">
      loading {numberFormatter.format(data.paymentRecordCount)} payment records
      {#if data.years}
         <Combobox
            data={yearComboboxData}
            value={yearSelect}
            label='or select year'
            placeholder='Select year ...'
            openOnChange={true}
            onValueChange={(details) => {
               goto(`/paymentRecords/year/${details.value[0]}`)
            }}
            zIndex='50'
         />
      {/if}
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
            <div class="bg-tertiary-50-950 w-screen rounded-b-lg fixed top-11 sm:top-9 p-1 flex">
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
            </div>
            <Modal
                  open={searchDrawerOpen}
                  onOpenChange={(event)=>(searchDrawerOpen = event.open)}
                  triggerBase='btn preset-filled-primary-50-950 rounded-lg fixed top-0 right-0 z-50 h-12 sm:h-auto'
                  contentBase='bg-surface-100-900 h-[400px] w-screen rounded-lg'
                  positionerJustify=''
                  positionerAlign=''
                  positionerPadding=''
                  transitionsPositionerIn={{y:-400, duration: 600}}
                  transitionsPositionerOut={{y:-400, duration: 600}}
                  modal={false}
            >
            {#snippet trigger()}
               <SearchIcon aria-label='Search' />
            {/snippet}
            {#snippet content()}
               <button onclick={()=>searchDrawerOpen=false} class='btn preset-filled-primary-50-950 rounded-lg m-1 absolute top-0 right-0'><PanelTopCloseIcon aria-label='Close'/></button>
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
            </Modal>
               <div class="mt-32 sm:mt-20" in:fade={{duration:600}} out:fade={{duration:0}}>
                  {#each slicedSource(sortedByDate(dateSearchPayments(searchedPayments(searchByUser(paymentRecords, currentUsers(customers)))))) as paymentRecord}
                  {@const customer = customers.find((customer) => customer.id === paymentRecord.customerId) }
                     <div class="rounded-lg border border-primary-50-950 grid sm:grid-cols-2 m-2">
                        <div>
                           <PaymentRecordEmployee paymentRecord={paymentRecord} classes="p-2" />
                           {#if !paymentRecord.refunded}
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
                           </div>
                        {/if}
                     </div>
                  {/each}
               </div>
               <Pagination bind:size={size} bind:pageNum={pageNum} array={dateSearchPayments(searchedPayments(searchByUser(paymentRecords, currentUsers(customers))))} label='payment records'/>
         {:else}
            No payment records from that year
         {/if}
      {/await}
   {/await}
{/await}