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
	import EmailCustomer from '$lib/emailCustomer.svelte';
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
      if(invoices.length > 0){
         startDate = dayjs.utc(invoices[0].invoiceCreated).startOf('year').toDate();
         minDate = startDate;
         endDate = new Date();
         maxDate = endDate;
      }
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
   let monthSelect = $state(['']);
   interface ComboboxData {
      label: string;
      value: string;
   }
   let monthComboboxData:ComboboxData[] = [
      {label:'Unpaid Invoices', value: 'unpaid'},
   ]
   for(const [index, month] of data.months.entries()){
      monthComboboxData.push({
         label: dayjs(month).add(1, 'month').format('MMMM'),
         value: (index+1).toString(),
      })
   }
   let searchDrawerOpen = $state(false);
   onNavigate(()=>{
      searchDrawerOpen = false
   })
</script>
{#await wrapper}
   <Header title='Loading invoices' />
   <div class="mx-1 sm:mx-2 mt-12 sm:mt-10" in:fade={{duration:600}}>
      Loading {numberFormatter.format(data.invoiceCount)} invoices, 
      <Combobox
         data={monthComboboxData}
         bind:value={monthSelect}
         label='or select year'
         placeholder='Select year...'
         openOnClick={true}
         onValueChange={(details) => {
               goto(`/invoices/year/${data.year}/month/${details.value[0]}`)
         }}
         classes='mx-1 sm:mx-2'
         zIndex='40'
      />
      <Placeholder numCols={1} numRows={size} heightClass='h-40' classes='z-0'/>
   </div>
   
   {:then invoices}
   {#await data.customers}
      <Header title='Loading customers' />
      <div class="mt-12 sm:mt-10">
         Loading customers...
      </div>
      <Placeholder numCols={1} numRows={size} heightClass='h-40'/>
   {:then customers}
      {#await data.addresses}
         <div class="mt-12 sm:mt-10">
               Loading addresses...
         </div>
         <Placeholder numCols={1} numRows={size} heightClass='h-40'/>
      {:then addresses}
         {#if invoices.length >0}
            <Header title='All invoices' />
            <Revenue 
               label="Total invoiced (not including deposits)" 
               amount={totalRevenue(searchedInvoices(dateSearchedInvoices(invoices)))} 
               classes='bg-tertiary-50-950 w-full rounded-b-lg fixed top-8 p-2 z-40'
            />
            <Modal
               open={searchDrawerOpen}
               onOpenChange={(event)=>(searchDrawerOpen = event.open)}
               triggerBase='btn preset-filled-primary-50-950 rounded-lg fixed top-0 right-0 z-50'
               contentBase='bg-surface-100-900 h-[360px] w-screen rounded-lg'
               positionerJustify=''
               positionerAlign=''
               positionerPadding=''
               transitionsPositionerIn={{y:-360, duration: 600}}
               transitionsPositionerOut={{y:-360, duration: 600}}
               modal={false}
            >
               {#snippet trigger()}
                  <SearchIcon aria-label='Search'/>
               {/snippet}
               {#snippet content()}  
                  <button onclick={()=>searchDrawerOpen=false} class='btn preset-filled-primary-50-950 rounded-lg m-1 absolute top-0 right-0'><PanelTopClose aria-label='Close'/></button>
                  <div class="mt-8">
                        <Search data={data.searchForm} bind:search={search} searchType='invoice number' classes='m-1 sm:m-2 '/>
                        <Search data={data.searchForm} bind:search={nameSearch} searchType='Customer' classes='m-1 sm:m-2 '/>
                        <DateSearch data={data.dateSearchForm} bind:startDate={startDate} bind:endDate={endDate} {minDate} {maxDate} classes='w-1/2 mb-1 sm:mb-2 mx-1 sm:mx-2'/>
                  </div>
               {/snippet}
            </Modal>
            <div class="grid grid-cols-1 sm:m-2 m-1 gap-2 mt-24 sm:mt-20" in:fade={{duration:600}} out:fade={{duration:0}}>
               {#each slicedInvoices(searchedInvoices(searchByUser(invoices, currentUsers(customers)))) as invoice}  
               {@const customer = customers.find((customer) => customer.id === invoice.customerId)}
                  <div class="sm:grid sm:grid-cols-2 border-2 border-primary-50-950 rounded-lg">
                        <InvoiceEmployee {invoice} classes=' px-2' />
                        {#if customer}
                        {@const address = addresses.find((address) => address.userId === customer.id)}
                           <div class="flex flex-col px-2 pt-2">
                              <UserEmployee user={customer} classes=''/>
                              {#if address}
                                    <Address {address} />
                              {/if}
                              {#if customer.email && customer.emailVerified}
                                 <EmailCustomer
                                    emailAddress={customer.email}
                                    recordNum={invoice.invoiceNum}
                                    buttonText='Email invoice'
                                    apiEndPoint='/api/sendInvoice'
                                 />
                              {/if}
                           </div>
                        {/if}
                  </div>
               {/each}
            </div>
            <Pagination bind:pageNum={pageNum} bind:size={size} array={searchedInvoices(searchByUser(invoices, currentUsers(customers)))} label='invoices' />
         {/if}
      {/await}
   {/await}
{/await}