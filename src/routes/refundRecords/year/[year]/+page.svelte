<script lang="ts">
	import RefundRecordEmployee from '$lib/displayComponents/RefundRecordEmployee.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import Search from '$lib/forms/Search.svelte';
   import dayjs from 'dayjs';
   import type { PageData } from './$types';
   import type { RefundRecord } from '@prisma/client'
   import DateSearch from '$lib/forms/DateSearch.svelte';
   import Pagination from '$lib/displayComponents/Pagination.svelte';
   import Revenue from '$lib/displayComponents/Revenue.svelte';
   import Header from '$lib/Header.svelte';
   import Address from '$lib/displayComponents/AddressEmployee.svelte';
	import { goto, onNavigate } from '$app/navigation';
	import EmailCustomer from '$lib/EmailCustomer.svelte';
	import DownloadPdfButton from '$lib/DownloadPDFButton.svelte';
	import SearchDrawer from '$lib/displayComponents/Modals/SearchDrawer.svelte';
   import Combobox from '$lib/formComponents/Combobox.svelte';
   import ProgressLine from '$lib/displayComponents/ProgressLine.svelte';
   import ProgressRing from '$lib/displayComponents/ProgressRing.svelte';
   
   let { data }: { data: PageData } = $props();
   let size = $state(25)
   let pageNum = $state(1)
   let search = $state('');
   let startDate = $state<Date>(new Date());
   let endDate = $state<Date>(new Date());
   let maxDate = $state<Date>();
   let minDate = $state<Date>();
   const earliestDate = $derived((refunds:RefundRecord[]) => {
      let returnedDate = new Date();
      for(const refund of refunds){
         if(refund.refundCreated < returnedDate){
            returnedDate = refund.refundCreated;
         }
      }
      return returnedDate;
   })
   const numberFormatter = new Intl.NumberFormat('en-US');
   let slicedRefunds = $derived((refunds:RefundRecord[]) => refunds.slice((pageNum-1)*size, pageNum*size))
   let searchRefunds = $derived((refunds:RefundRecord[]) => refunds.filter((refund) => refund.refundNumber.toString().includes(search)))
   let dateSearchRefunds = $derived((refunds:RefundRecord[]) => refunds.filter((refund) => {
      if(!startDate || !endDate){
         return
      }
      return refund.refundCreated >= startDate && refund.refundCreated <= endDate
   }))
   let totalRevenue = $derived((refunds:RefundRecord[]) => {
      let totalRevenue:number = 0;
      
      refunds.forEach((refund) =>{
         totalRevenue += refund.refundAmount
      })
      return totalRevenue
   })
   interface ComboboxData {
      label: string;
      value: string;
   }
   let monthComboBoxData:ComboboxData[] = []
   for(const month of data.months){
      monthComboBoxData.push({label:dayjs(month).format('MMMM'), value:month.toUTCString()})
   }
   let searchDrawerOpen = $state(false);
   let delayed = $state(false);
   let timeout = $state(false);
   onNavigate(() =>{
      delayed = false;
      timeout = false
   })
</script>

<Header title='Refund Records' />
{#await data.refunds}
   <div class="mt-18 sm:mt-16 mx-1 sm:mx-2 mb-8">
      
      <Combobox
         data={monthComboBoxData}
         onValueChange={(details) => {
            const date = dayjs(parseInt(details.value[0]))
            goto(`/refundRecords/year/${date.format('YYYY')}/month/${(date.get('month'))+1}`)
         }}
         placeholder='Select Month'
         label='Loading {numberFormatter.format(data.refundCount)} refund records or select month:'
      />
      {#if delayed}
         <ProgressRing  
            value={null}
            {@attach () => {
               setTimeout(() => {
                  delayed = false;
                  timeout = true;
               }, 800)
            }}
         />
      {/if}
      {#if timeout}
         <ProgressLine value={null} />
      {/if}
   </div>
   {:then refunds}
      {#await data.customers}
         Loading customers
      {:then customers}
         {#await data.addresses}
            Loading addresses
         {:then addresses} 
            {#if refunds.length > 0}
               <SearchDrawer
                  modalOpen={searchDrawerOpen}
                  height='h-[180px]'
               >
                  {#snippet content()}
                     <Search
                        bind:search 
                        searchType="Refund records" 
                        data={data.searchForm} 
                        classes='p-2 '	
                     />
                     <DateSearch 
                        bind:endDate 
                        bind:startDate 
                        data={data.dateSearchForm} 
                        {minDate} 
                        {maxDate} 
                        classes='p-2'	
                        {@attach () => {
                           startDate = earliestDate(refunds);
                           minDate = startDate;
                        }}
                     />
                  {/snippet}
               </SearchDrawer>
               <Revenue 
                  label="Total refunds" 
                  amount={totalRevenue(searchRefunds(dateSearchRefunds(refunds)))}
                  classes='bg-tertiary-50-950 w-full rounded-b-lg fixed top-11 sm:top-8 p-0.5 z-40'	
               />
            <div class="mt-22 sm:mt-20 mx-1 sm:mx-2 mb-20 sm:mb-12 lg:mb-8">
               {#each slicedRefunds(searchRefunds(dateSearchRefunds(refunds))) as refund (refund.refundNumber)}
               {@const customer = customers.find((customer) => customer.id === refund.customerId)}
                  <div class="border-2 rounded-lg border-primary-50-950 my-2 flex flex-col sm:flex-row"> 
                     <div >
                        <RefundRecordEmployee refundRecord={refund} classes='mx-2'/>
                        <div class="m-2 flex flex-col sm:flex-row gap-2">
                           {#if customer?.email }
                              <EmailCustomer
                                 emailAddress={customer.email}
                                 recordNum={refund.refundNumber}
                                 apiEndPoint='/api/sendRefund'
                                 buttonText='Email refund' 
                              />
                           {/if}
                           <DownloadPdfButton
                              recordType='refundNum'
                              num={refund.refundNumber}
                           />
                        </div>   
                     </div>
                     {#if customer}
                     {@const address = addresses.find((address) => address.userId === customer.id)}
                        <div class="flex flex-col min-w-1/3">
                           <UserEmployee user={customer} classes='mt-2 mx-2 ' />
                           {#if address}
                              <Address {address} classes='mx-2'/>
                           {/if}
                        </div>
                     {/if}
                  </div>
               {/each}
               <Pagination bind:size bind:pageNum label="refund records" array={searchRefunds(dateSearchRefunds(refunds))} />
            </div>
         {/if}
      {/await}
   {/await} 
{/await}