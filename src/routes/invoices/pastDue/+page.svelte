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
   import { onNavigate } from '$app/navigation';
	import EmailCustomer from '$lib/EmailCustomer.svelte';
   import DownloadPdfButton from '$lib/DownloadPDFButton.svelte';
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
   const numberFormatter = new Intl.NumberFormat('en-US');
   let nameSearch = $state('');
   let currentUsers = $derived((users:User[]) => users.filter((user) => {
      return user.givenName?.toLowerCase().includes(nameSearch.toLowerCase()) || user.familyName?.toLowerCase().includes(nameSearch.toLowerCase())
   }))
   const searchByUser = $derived((invoices:Invoice[], customers:User[]) => {
      const users = currentUsers(customers);
      const customerInvoices:Invoice[] = [];
      for(const user of users){
         const userInvoices = invoices.filter((invoice) => {
               return invoice.customerId === user.id
         })
         for(const invoice of userInvoices) {
               customerInvoices.push(invoice)
         }
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
   let searchDrawerOpen = $state(false);
   onNavigate(()=>{
      searchDrawerOpen = false
   })
</script>
{#await data.invoices}
   <Header title='Loading invoices' />
   <div class="mt-14 sm:mt-10 mx-1 sm:mx-2">
      Loading {numberFormatter.format(data.invoiceCount!)} invoices, 
      <Placeholder numCols={1} numRows={size} heightClass='h-40'/>
   </div>
   {:then invoices}
      {#await data.customers}
         <Header title='Loading customers' />
         <div class="mt-14 sm:mt-10 mx-1 sm:mx-2">
            Loading customers...
            <Placeholder numCols={1} numRows={size} heightClass='h-40'/>
         </div>
      {:then customers}
         {#await data.addresses}
            <Header title='Loading addresses' />
            <div class="mt-14 sm:mt-10 mx-1 sm:mx-2">
               Loading addresses...
               <Placeholder numCols={1} numRows={size} heightClass='h-40'/>
            </div>
         {:then addresses}
            {#if invoices.length >0}       
            <Header title='Past Due invoices' />
            <Revenue label="Current past due invoice total" amount={totalRevenue(invoices)} classes="bg-tertiary-50-950 w-screen rounded-b-lg fixed top-10 sm:top-7 p-2 left-0 z-30"/>
            <SearchDrawer
               modalOpen={searchDrawerOpen}
               height='h-[180px]'
            >

               {#snippet content()}
                  <div class="mt-8">
                     <Search data={data.searchForm} bind:search={search} searchType='invoice number' classes='m-1 sm:m-2 '/>
                     <Search data={data.searchForm} bind:search={nameSearch} searchType='Customer' classes='m-1 sm:m-2 '/>
                     <DateSearch data={data.dateSearchForm} bind:startDate={startDate} bind:endDate={endDate} {minDate} {maxDate} classes='w-1/2 mb-1 sm:mb-2 mx-1 sm:mx-2'/>
                  </div>
               {/snippet}
            </SearchDrawer>
            <div class="m-1 sm:m-2 sm:mt-20 mt-22 mb-20 sm:mb-12 lg:mb-8 z-30">
               <div class="grid grid-cols-1 gap-y-3 gap-x-1" in:fade={{duration:600}} out:fade={{duration:0}}>
                  {#each  slicedInvoices(searchedInvoices(searchByUser(invoices, currentUsers(customers)))) as invoice}  
                  {@const customer = customers.find((customer) => customer.id === invoice.customerId)}  
                     <div class="rounded-lg border border-primary-50-950 grid sm:grid-cols-2">
                        <div>
                           <InvoiceEmployee {invoice} classes='px-2' />
                           <div class="flex gap-2 m-2">
                              {#if invoice.invoiceAmount > invoice.amountPaid}
                                 <a href="/paymentRecords/new?userId={customer?.id}&invoiceNum={invoice.invoiceNum}" class="btn preset-filled-primary-50-950 h-8">Make payment record for this invoice</a>
                              {/if}
                              {#if customer?.emailVerified && customer.email}
                                 <EmailCustomer
                                    apiEndPoint='/api/sendInvoice'
                                    recordNum={invoice.invoiceNum}
                                    emailAddress={customer.email}
                                    buttonText='Email Invoice to customer'
                                 />
                              {/if}
                              <DownloadPdfButton
                                 recordType='invoiceNum'
                                 num={invoice.invoiceNum}
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
               </div>
               <Pagination bind:pageNum={pageNum} bind:size={size} array={searchedInvoices(invoices)} label='invoices' />
            </div>
         {/if}
      {/await}
   {/await}
{/await}