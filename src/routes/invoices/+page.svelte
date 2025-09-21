<script lang="ts">
   import { fade } from 'svelte/transition';
   import type { PageData } from './$types';
   import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
   import type { Invoice, User } from '@prisma/client';
   import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
   import Header from '$lib/Header.svelte';
   import Pagination from '$lib/displayComponents/Pagination.svelte';
   import Placeholder from '$lib/displayComponents/Placeholder.svelte';
   import Search from '$lib/forms/Search.svelte';
   import DateSearch from '$lib/forms/DateSearch.svelte';
   import dayjs from 'dayjs';
   import utc from 'dayjs/plugin/utc'
   import Revenue from '$lib/displayComponents/Revenue.svelte';
   import Address from '$lib/displayComponents/AddressEmployee.svelte';
   import { Combobox, Modal } from '@skeletonlabs/skeleton-svelte';
   import { goto, onNavigate } from '$app/navigation';
   import { PanelTopClose, SearchIcon } from 'lucide-svelte';
	import EmailCustomer from '$lib/EmailCustomer.svelte';
   import DownloadPdfButton from '$lib/DownloadPDFButton.svelte';
	import { onMount } from 'svelte';
   dayjs.extend(utc)
   let { data }: { data: PageData } = $props();
   let pageNum = $state(1);
   let size = $state(25);
   let search = $state('');
   let startDate = $state<Date>(new Date());
   let endDate = $state<Date>(new Date());
   let maxDate = $state<Date>();
   let minDate = $state<Date>();
   const numberFormatter = new Intl.NumberFormat('en-US');
   const wrapper = new Promise<Invoice[]>(async res => {
      const invoices = await data.invoices
      startDate = dayjs.utc(invoices[0].invoiceCreated).startOf('year').toDate();
      minDate = startDate;
      endDate = new Date();
      maxDate = endDate;
      res(invoices)
   })

   let nameSearch = $state('');
   let currentUsers = $derived((users:User[]) => users.filter((user) => {
      return user.givenName?.toLowerCase().includes(nameSearch.toLowerCase()) || user.familyName?.toLowerCase().includes(nameSearch.toLowerCase()) || user.organizationName?.toLowerCase().includes(nameSearch.toLowerCase())
   }))
   const searchByUser = $derived((invoices:Invoice[], customers:User[]) => {
      const customerInvoices:Invoice[] = [];
      for(const user of customers){
         const userInvoices = invoices.filter((invoice) => {
               return invoice.customerId === user.id
         })
         userInvoices.forEach((invoice) => {
               customerInvoices.push(invoice)
         })
      }
      return customerInvoices
   })
   let slicedInvoices = $derived((invoices:Invoice[]) => invoices.slice((pageNum-1)*size, pageNum*size));
   let searchedInvoices = $derived((invoices:Invoice[]) => invoices.filter((invoice) => invoice.invoiceNum.toString().includes(search)));
   let dateSearchedInvoices = $derived((invoices:Invoice[]) => invoices.filter((invoice) => {
      if(!startDate || !endDate){
         return
      }
      return invoice.invoiceCreated >= startDate && invoice.invoiceCreated <= endDate
   }))
   let totalRevenue = $derived((invoices:Invoice[]) => {
      let totalRevenue = 0;
      invoices.forEach((invoice) => {
         if(!invoice.deposit){
               totalRevenue += invoice.invoiceAmount
         }
      })
      return totalRevenue
   })
   let sortBy = $state(false)
   let sortedByDate = $derived((invoices:Invoice[]) => invoices.sort((a,b) => {
      if(a.invoiceCreated > b.invoiceCreated){
         if(sortBy){
            return -1
         }
         return 1
      }
      if(a.invoiceCreated < b.invoiceCreated){
         if(sortBy){
            return 1
         }
         return -1
      }
      return 0
   }))
   let yearSelect = $state(['']);
   interface ComboboxData {
      label: string;
      value: string;
   }
   let yearComboboxData:ComboboxData[] = $derived(data.years.map(year => ({
      label: year.toString(),
      value: year.toString()
   })))
   
   let searchDrawerOpen = $state(false);
   onNavigate(()=>{
      searchDrawerOpen = false
   })
   onMount(() =>{
      yearComboboxData.unshift({
         label:'Unpaid',
         value: 'unpaid'
      }, {
         label: 'Past Due',
         value: 'pastDue'
      })
   })
</script>
{#await wrapper}
   <Header title='Loading invoices' />
   <div class="mx-1 sm:mx-2 mt-14 sm:mt-10" in:fade={{duration:600}}>
      Loading {numberFormatter.format(data.invoiceCount)} invoices, 
      <Combobox
         data={yearComboboxData}
         value={yearSelect}
         label='or select year'
         placeholder='Select year...'
         openOnClick={true}
         onValueChange={(details) => {
            if(details.value[0] === 'unpaid'){
               goto('/invoices/unpaid');
            } else if(details.value[0] === 'pastDue') {
               goto('/invoices/pastDue')
            } else {
               goto(`/invoices/year/${details.value[0]}`);
            }
         }}
         classes='mx-1 sm:mx-2'
         zIndex='40'
      />
      <Placeholder numCols={1} numRows={size} heightClass='h-40' classes='z-0'/>
   </div>
   
   {:then invoices}
   {#await data.customers}
      <Header title='Loading customers' />
      <div class="mt-14 sm:mt-10">
         Loading customers...
      </div>
      <Placeholder numCols={1} numRows={size} heightClass='h-40'/>
   {:then customers}
      {#await data.addresses}
         <div class="mt-14 sm:mt-10">
               Loading addresses...
         </div>
         <Placeholder numCols={1} numRows={size} heightClass='h-40'/>
      {:then addresses}
         {#if invoices.length >0}
            <Header title='All invoices' />
            <Revenue 
               label="Total invoiced (not including deposits)" 
               amount={totalRevenue(searchedInvoices(dateSearchedInvoices(invoices)))} 
               classes='bg-tertiary-50-950 w-full rounded-b-lg fixed top-11 sm:top-8 p-2 z-40'
            />
            <Modal
               open={searchDrawerOpen}
               onOpenChange={(event)=>(searchDrawerOpen = event.open)}
               triggerBase='btn preset-filled-primary-50-950 rounded-lg fixed top-0 right-0 z-50 h-12 sm:h-8'
               contentBase='bg-surface-100-900 h-[385px] sm:h-[180px] w-screen rounded-lg'
               positionerJustify=''
               positionerAlign=''
               positionerPadding=''
               transitionsPositionerIn={{y:-390, duration: 600}}
               transitionsPositionerOut={{y:-390, duration: 600}}
               modal={false}
            >
               {#snippet trigger()}
                  <SearchIcon aria-label='Search'/>
               {/snippet}
               {#snippet content()}  
                  <button onclick={()=>searchDrawerOpen=false} class='btn preset-filled-primary-50-950 rounded-lg m-1 absolute top-0 right-0'><PanelTopClose aria-label='Close'/></button>
                  <div class="mt-8 flex flex-col sm:flex-row gap-2 mx-2">
                     <Search data={data.searchForm} bind:search={search} searchType='invoice number' classes=''/>
                     <Search data={data.searchForm} bind:search={nameSearch} searchType='Customer' classes=''/>
                     <DateSearch data={data.dateSearchForm} bind:startDate={startDate} bind:endDate={endDate} {minDate} {maxDate} classes=''/>
                  </div>
                  <button class="btn preset-filled-primary-50-950 m-1 sm:m-2 h-8" onclick={()=> {
                     sortBy = !sortBy;
                     searchDrawerOpen = false;
                  }}>
                     Sort by date {sortBy? 'starting earliest' : 'starting latest'}
                  </button>
               {/snippet}
            </Modal>
            <div class="grid grid-cols-1 sm:m-2 m-1 gap-2 mt-28 sm:mt-20 mb-8 sm:mb-8" in:fade={{duration:600}} out:fade={{duration:0}}>
               {#each slicedInvoices(sortedByDate(dateSearchedInvoices(searchedInvoices(searchByUser(invoices, currentUsers(customers)))))) as invoice}  
               {@const customer = customers.find((customer) => customer.id === invoice.customerId)}
                  <div class="sm:grid sm:grid-cols-2 border-2 border-primary-50-950 rounded-lg ">
                     <div>
                        <InvoiceEmployee {invoice} classes=' px-2' />
                        <div class="flex flex-col sm:flex-row">
                           {#if !invoice.paymentRecordNum}
                              <a href="/paymentRecords/new?userId={customer?.id}&invoiceNum={invoice.invoiceNum}" class="btn preset-filled-primary-50-950 h-8 sm:mr-2 ml-2 mt-2 rounded-lg w-80">Make payment record For this invoice</a>
                           {/if}
                           {#if customer?.email && customer.emailVerified}
                              <EmailCustomer
                                 emailAddress={customer.email}
                                 recordNum={invoice.invoiceNum}
                                 buttonText='Email invoice'
                                 apiEndPoint='/api/sendInvoice'
                                 classes='my-2 m-2'
                              />
                           {/if}
                           <DownloadPdfButton
                              recordType='invoiceNum'
                              num={invoice.invoiceNum}
                              classes='mx-2'
                           />
                        </div>
                     </div>
                     {#if customer}
                     {@const address = addresses.find((address) => address.userId === customer.id)}
                        <div class="flex flex-col px-2 pt-2">
                           <UserEmployee user={customer} classes=''/>
                           {#if address}
                                 <Address {address} />
                           {/if}
                        </div>
                     {/if}
                  </div>
               {/each}
               <Pagination bind:pageNum={pageNum} bind:size={size} array={searchedInvoices(searchByUser(invoices, currentUsers(customers)))} label='invoices' />
            </div>
         {/if}
      {/await}
   {/await}
{/await}