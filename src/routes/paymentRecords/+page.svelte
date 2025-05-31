<script lang="ts">
   import type { PageData } from './$types';
   import type { PaymentRecord } from '@prisma/client';
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
   let nonDeposits = $state<PaymentRecord[]>([]);
   let wrapper = new Promise<PaymentRecord[]>(async res => {
      const paymentRecords = await data.paymentRecords
      res(paymentRecords)
      if(paymentRecords.length > 0){
         startDate = dayjs.utc(paymentRecords[0].paymentCreated).startOf('year').toDate();
         minDate = startDate;
         endDate = dayjs.utc(paymentRecords[paymentRecords.length-1].paymentCreated).endOf('year').toDate();
         maxDate = endDate;
      }
      for(const paymentRecord of paymentRecords){
         if(!paymentRecord.deposit){
            nonDeposits.push(paymentRecord)
         }
      }
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
    let searchDrawerOpen = $state(false)
</script>
<Modal
   bind:open={modalOpen}
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
   <div class="mx-1 sm:mx-2">
      loading {numberFormatter.format(data.paymentRecordCount)} payment records
      {#if data.years}
         <Combobox
            data={yearComboboxData}
            bind:value={yearSelect}
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
      Loading customers...
   {:then customers} 
      {#await data.addresses}
         Loading contacts...
      {:then addresses}         
         {#if paymentRecords.length >0}
            <div class="bg-tertiary-50-950 w-screen rounded-b-lg fixed top-8 flex">
               <Revenue 
                  label="Total revenue" 
                  amount={totalRevenue(searchedPayments(dateSearchPayments(paymentRecords)))} 
                  classes='m-2'    
               />
               <Revenue
                  label='Non-deposit revenue'
                  amount={totalRevenue(nonDeposits)}
                  classes='m-2'
               />
            </div>
            <Modal
                  open={searchDrawerOpen}
                  onOpenChange={(event)=>(searchDrawerOpen = event.open)}
                  triggerBase='btn preset-filled-primary-50-950 rounded-lg fixed top-0 right-0 sm:right-0 z-50'
                  contentBase='bg-surface-100-900 h-[280px] w-screen rounded-lg'
                  positionerJustify=''
                  positionerAlign=''
                  positionerPadding=''
                  transitionsPositionerIn={{y:-360, duration: 600}}
                  transitionsPositionerOut={{y:-360, duration: 600}}
                  modal={false}
            >
            {#snippet trigger()}
               <SearchIcon />
            {/snippet}
            {#snippet content()}
               <button onclick={()=>searchDrawerOpen=false} class='btn preset-filled-primary-50-950 rounded-lg m-1 absolute top-0 right-0'><PanelTopCloseIcon/></button>
               <Search 
                  bind:search={search} 
                  searchType='payment record number' 
                  data={data.searchForm}
                  classes='m-1 sm:m-2 mt-9 sm:mt-9'
               />      
               <DateSearch 
                  bind:startDate={startDate} 
                  bind:endDate={endDate} 
                  {minDate} 
                  {maxDate} 
                  data={data.dateSearchForm}
                  classes='flex flex-col md:grid md:grid-cols-2 m-1 sm:m-2'    
               />
               <button onclick={()=>sortBy = !sortBy} class="anchor col-span-full">Sort by date {sortBy ? 'starting earliest' : 'starting latest'}</button>
            {/snippet}
            </Modal>
               <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-1 m-2 mt-26 sm:mt-12" in:fade={{duration:600}}>
                  {#each slicedSource(dateSearchPayments(searchedPayments(sortedByDate(paymentRecords)))) as paymentRecord}
                  {@const customer = customers.find((customer) => customer.id === paymentRecord.customerId) }
                     <div class="rounded-lg border border-primary-50-950 grid sm:grid-cols-2">
                        <div>
                           <PaymentRecordEmployee paymentRecord={paymentRecord} classes="p-2" />
                           {#if !paymentRecord.refunded}
                                 <button type="button" class="btn rounded-lg preset-filled-primary-50-950 m-2" onclick={() => refundModal(paymentRecord)}>Refund this payment</button>
                           {/if}
                        </div>
                        {#if customer}
                        {@const address = addresses.find((address)=> address.userId === customer.id)}
                           <div class="flex flex-col">
                              <UserEmployee user={customer} classes='mx-2 mt-2'/>
                              {#if address}
                                 <Address {address} classes='mx-2'/>
                              {/if}
                           </div>
                        {/if}
                     </div>
                  {/each}
               </div>
               <Pagination bind:size={size} bind:pageNum={pageNum} array={searchedPayments(paymentRecords)} label='payment records'/>
         {:else}
            No payment records from that year
         {/if}
      {/await}
   {/await}
{/await}