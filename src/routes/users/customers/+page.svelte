<script lang="ts">
   import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
   import type { PageData } from './$types';
   import Header from '$lib/Header.svelte';
   import Pagination from '$lib/displayComponents/Pagination.svelte';
   import { fade } from 'svelte/transition';
   import Search from '$lib/forms/Search.svelte';
   import Revenue from '$lib/displayComponents/Revenue.svelte';
   import type { Invoice, Lease, PaymentRecord, Unit, User, Address } from '../../../generated/prisma/browser';
   import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
	import UserNotesForm from '$lib/forms/UserNotesForm.svelte';
	import LeaseEndForm from '$lib/forms/LeaseEndForm.svelte';
	import UnitNotesForm from '$lib/forms/UnitNotesForm.svelte';
	import { onNavigate } from '$app/navigation';
	import SearchDrawer from '$lib/displayComponents/Modals/SearchDrawer.svelte';
	import FormModal from '$lib/displayComponents/Modals/FormModal.svelte';
	import RevenueBar from '$lib/displayComponents/RevenueBar.svelte';
	import UserRevenue from '$lib/displayComponents/UserRevenue.svelte';
	import { PUBLIC_COMPANY_NAME } from '$env/static/public';
	import dayjs from 'dayjs';
	import { sortUsers } from '$lib/userSort';
   import { fromStore } from 'svelte/store';
	import Button from '$lib/core/Button.svelte';
   import { source } from 'sveltekit-sse';
	import type { Readable } from 'svelte/store';
	import type { SourceSelected, Source } from 'sveltekit-sse';
   
   let { data }: { data: PageData } = $props();
   let pageNum = $state(1);
   let size = $state(25);
   let search = $state('');
   let slicedSource = $derived((customers:User[]) => customers.slice((pageNum-1)*size, pageNum*size));
   let searchedSource = $derived((customers:User[]) => customers.filter((customer) => {
      return customer.familyName?.toLowerCase().includes(search.toLowerCase()) 
      || customer.givenName?.toLowerCase().includes(search.toLowerCase())
      || customer.organizationName?.toLowerCase().includes(search.toLowerCase())
   }));
   let phoneSearch = $state('');
   let phoneSearcher = $derived((customers:User[], addresses:Address[]) => {
      const searchedAddresses = addresses.filter((add) => add.phoneNum1?.toLowerCase().includes(phoneSearch.replaceAll('-', '').replaceAll(' ', '').replaceAll('(', '').replaceAll(')', '').toLowerCase()));
      const users:User[] = [];
      for(const address of searchedAddresses){
         const user = customers.find((customer) => customer.id === address.userId)
         if(user){
            users.push(user);
         }
      }
      return users;
   })
   let totalLeased = $derived((leases:Lease[]) => {
      let totalLeased = 0;
      leases.forEach((lease) => {
         totalLeased += lease.price
      });
      return totalLeased
   })
   let totalInvoiced = $derived((invoices:Invoice[]) => {
      let total = 0;
      for(const invoice of invoices){
         total += invoice.invoiceAmount;
      }
      return total;
   });
   let totalPaid = $derived((paymentRecords:PaymentRecord[]) =>{
      let total = 0;
      for(const payment of paymentRecords){
         total += payment.paymentAmount;
      }
      return total;
   });
   let sortedUsers = $derived((customers:User[]) => sortUsers(customers));
   let overdueInvoices = $derived((invoices:Invoice[]) => invoices.filter((invoice) => {
      return invoice.invoiceDue <= new Date() && (invoice.invoiceAmount > invoice.amountPaid);
   }))
   let searchDrawerOpen = $state(false);
   let leaseEndModalOpen = $state(false);
   let currentLeaseId = $state('');
   let currentUnit = $state<Unit>();
	let connection: Source | undefined = $state();
	let csv: Readable<string> & SourceSelected | undefined = $state();
	let value: Readable<string> & SourceSelected | undefined = $state();
	let valueState: {
    	readonly current: string;
	} | undefined = $state();
	let csvState: {
    	readonly current: string;
	} | undefined = $state();
   function leaseEndModal(leaseId:string, unit:Unit){
      currentLeaseId = leaseId;
      currentUnit = unit;
      leaseEndModalOpen = true;
   }
   let csvPurpose = $state('')
   $effect(() => {
      if(csvState && csvState?.current !== '' && csvPurpose === 'currentCustomers'){
			const blob = new Blob([csvState.current], {
				type: 'application/csv'
			});
			const url = URL.createObjectURL(blob);
			const filename = `${PUBLIC_COMPANY_NAME} current customers report ${dayjs().format('MMMM D YYYY')}.csv`
			const a = document.createElement('a');
			a.download = filename;
			a.href = url;
			document.body.append(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}
      if(csvState && csvState?.current !== '' && csvPurpose === 'phoneBook'){
         console.log('phone book download')
			const blob = new Blob([csvState.current], {
				type: 'application/csv'
			});
			const url = URL.createObjectURL(blob);
			const filename = `${PUBLIC_COMPANY_NAME} phone book ${dayjs().format('MMMM D YYYY')}.csv`
			const a = document.createElement('a');
			a.download = filename;
			a.href = url;
			document.body.append(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}
		if(valueState && valueState.current === 'CSV ready'){
         setTimeout(() => {
            connection?.close();
				valueState = undefined;
            connection = undefined;
			}, 1500);
		}
   })
   onNavigate(() => {
      leaseEndModalOpen = false;
      currentLeaseId = '';
      currentUnit = undefined;
   });
</script>
<Header title='Current Customers'/>
{#await data.customers}
   <div class="mt-14 sm:mt-10 mx-2">
      Loading {data.customerCount} customers...
   </div>
{:then customers}
   {#await data.leases}
      <div class="mt-14 sm:mt-10 mx-2">
         Loading leases...
      </div>   
   {:then leases} 
      {#await data.addresses}
         <div class="mt-14 sm:mt-10 mx-2">
            Loading addresses...
         </div>
      {:then addresses}
         {#await data.invoices}
            <div class="mt-14 sm:mt-10 mx-2">
               Loading invoices...
            </div>
         {:then invoices}
            {#await data.paymentRecords}
               <div class="mt-14 sm:mt-10 mx-2">
                  Loading payments...
               </div>               
            {:then paymentRecords}  
               {#await data.units}
                  <div class="mt-14 sm:mt-10 mx-2">
                     Loading units...
                  </div>
               {:then units}
                  <div in:fade={{duration:600}} class="mt-20 sm:mt-18 mb-8 sm:mb-8" >
                     <RevenueBar>
                        {#snippet content()}
                           <Revenue label='Current monthly invoiced' amount={totalLeased(leases)} />
                        {/snippet}
                     </RevenueBar>
                     <SearchDrawer
                        modalOpen={searchDrawerOpen}
                        height='h-[230px] sm:h-[120px]'
                     >
                        {#snippet content()}
                           <Search bind:search={search} searchType='customer name' data={data.userSearchForm} classes='' />
                           <Search bind:search={phoneSearch} searchType='phone number' data={data.userSearchForm}  />
                           <div class="flex flex-col sm:flex-row gap-2 justify-center align-middle">
                              <Button
                                 label='Download CSV phone book'
                                 type='button'
                                 onClick={() => {
                                    connection = source('/api/csv?phoneBook=true');
                                    value = connection.select('message');
                                    valueState = fromStore(value);
                                    csv = connection.select('csv');
                                    csvState = fromStore(csv);
                                    csvPurpose = 'phoneBook'
                                 }}
                              />
                              <Button
                                 label='Download CSV of current customers'
                                 type='button'
                                 onClick={async () => {
                                    connection = source('/api/csv?currentCustomers=true');
                                    value = connection.select('message');
                                    valueState = fromStore(value);
                                    csv = connection.select('csv');
                                    csvState = fromStore(csv);
                                    csvPurpose = 'currentCustomers'
                                 }}
                              />
                              {valueState?.current}
                           </div>
                        {/snippet}
                     </SearchDrawer>
                     <FormModal
                        bind:modalOpen={leaseEndModalOpen}
                     >
                        {#snippet content()}
                           <LeaseEndForm data={data.leaseEndForm} {leaseEndModalOpen} leaseId={currentLeaseId} employee={true}/>
                           {#if currentUnit}
                              <UnitNotesForm data={data.unitNotesForm} unit={currentUnit}/>
                           {/if}
                        {/snippet}
                  </FormModal>
                     <div class="grid grid-cols-1 mx-1 sm:mx-2 gap-y-2 gap-x-1 ">
                        {#each slicedSource(searchedSource(phoneSearcher(sortedUsers(customers), addresses))) as customer (customer.id)}
                        {@const address = addresses.find((address) => address.userId === customer.id)}
                        {@const customerLeases = leases.filter((lease) => lease.customerId === customer.id)}
                        {@const customerInvoices = invoices.filter((invoice) => invoice.customerId === customer.id)}
                        {@const customerPayments = paymentRecords.filter((payment) => payment.customerId === customer.id)}
                           <div class="border rounded-lg border-primary-50-950 sm:grid sm:grid-cols-1">
                              <div class="m-2 flex gap-2">
                                 <UserEmployee user={customer} classes='max-w-1/2'/>
                                 {#if address}
                                    <AddressEmployee {address} />
                                 {/if}
                              </div>
                              <div class="m-2">
                                 <UserNotesForm user={customer} data={data.userNotesForm} />
                                 <UserRevenue 
                                    totalInvoiced={totalInvoiced(customerInvoices)}
                                    totalPaid={totalPaid(customerPayments)}
                                    {customer}
                                    invoices={overdueInvoices(customerInvoices)}
                                    overdueAmount={totalInvoiced(overdueInvoices(customerInvoices  ))}
                                 />
                              </div>
                              {#if customerLeases}
                                 {#each customerLeases as lease}
                                 {@const unit = units.find((unit) => unit.num === lease.unitNum)}
                                    <div class='flex flex-col sm:flex-row gap-2 mx-2 mb-2'>
                                       <LeaseEmployee {lease} open={true} classes='my-2'/>
                                       <a href="/invoices/new?leaseId={lease.leaseId}" class="btn preset-filled-primary-50-950 h-8">Make an invoice for this lease</a>
                                       {#if unit}
                                          <button type="button" onclick={()=>leaseEndModal(lease.leaseId, unit)} class="btn preset-filled-primary-50-950 h-8">End lease</button>
                                       {/if}
                                    </div>
                                 {/each}
                              {/if}
                           </div>
                        {/each}
                     </div>
                     <Pagination bind:pageNum={pageNum} bind:size={size} label='users' array={searchedSource(customers)}/>
                  </div>
               {/await}
            {/await}            
         {/await}    
      {/await}
   {/await}
{/await}