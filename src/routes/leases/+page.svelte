<script lang="ts">
   import Header from '$lib/Header.svelte';
	import type { User, Lease } from "../../generated/prisma/browser"
   import type { PageData } from './$types';
	import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import Search from '$lib/forms/Search.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
	import SearchDrawer from '$lib/displayComponents/Modals/SearchDrawer.svelte';
	import Button from '$lib/core/Button.svelte';
   import { source } from 'sveltekit-sse';
	import type { Readable } from 'svelte/store';
	import type { SourceSelected, Source } from 'sveltekit-sse';
   import { fromStore } from 'svelte/store';
   import { PUBLIC_COMPANY_NAME } from '$env/static/public';
   import dayjs from 'dayjs';

   let { data }: { data: PageData } = $props();
   let search = $state('');
   let pageNum = $state(1);
   let size = $state(25);
   let connection = $state<Source>();
	let csv = $state<Readable<string> & SourceSelected >();
	let value = $state<Readable<string> & SourceSelected>();
	let valueState = $state<{readonly current: string;}>();
	let csvState = $state<{readonly current: string;}>();
   let csvPurpose = $state('');
   let searchedLeases = $derived((leases:Lease[]) => leases.filter((lease) => lease.leaseId.includes(search)))
   let slicedLeases = $derived((leases:Lease[]) => leases.slice((pageNum-1)*size, pageNum*size));
   const currentCustomers = $derived((users:User[]) => {
      const returnedUsers = users.filter((user) => {
         return user.familyName?.includes(customerSearch) 
         || user.givenName?.includes(customerSearch)
         || user.organizationName?.includes(customerSearch)
      })
      return returnedUsers;
   })
   const searchByCustomer = $derived((leases:Lease[], customers:User[]) => {
      const returnedLeases:Lease[] =[];
      for(const customer of customers){
         const customerLeases = leases.filter((lease) => lease.customerId === customer.id)
         for(const cL of customerLeases){
            returnedLeases.push(cL)
         }
      }
      return returnedLeases
   })
   let customerSearch = $state('');
   let searchDrawerOpen = $state(false);
   let sortBy = $state(false);
   let sortedByUnitNum = $derived((leases:Lease[]) => leases.sort((a,b) => {
      if(a.unitNum > b.unitNum){
         if(sortBy){
            return -1
         }
         return 1
      }
      if(a.unitNum === b.unitNum){
         return 0
      }
      if(a.unitNum < b.unitNum){
         if(sortBy){
            return 1
         }
         return -1
      }
      return 0
   }));
   $effect(() => {
      if(csvState && csvState?.current !== '' && csvPurpose === 'currentCustomers'){
			const blob = new Blob([csvState.current], {
				type: 'application/csv'
			});
			const url = URL.createObjectURL(blob);
			const filename = `${PUBLIC_COMPANY_NAME} current leases report ${dayjs().format('MMMM D YYYY')}.csv`
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
</script>
<Header title='All leases' />

{#await data.leases}
   <div class="mt-14 sm:mt-10">
      Loading {data.leaseCount} leases...
   </div>
{:then leases}
   {#await data.customers}
      <div class="mt-14 sm:mt-10 mx-1">
         Loading customers...
      </div>
   {:then customers} 
      {#await data.addresses}
         <div class="mt-14 sm:mt-10 mx-1">
            Loading addresses...
         </div>
      {:then addresses}
         <SearchDrawer
            modalOpen={searchDrawerOpen}
            height='h-[180px]'
         >
            {#snippet content()}
               <Search bind:search={search} searchType='lease id' data={data.searchForm} classes='mx-1'/>
               <Search bind:search={customerSearch} searchType='customer name' data={data.searchForm} classes='mx-1' />
               <Button
                  label='Sort by unit number {sortBy ? 'ascending' : 'descending'}'
                  type='button'
                  onClick={() => sortBy = !sortBy}
               />
               <div class="flex flex-col">
                  <Button
                     label='Download lease report CSV'
                     type='button'
                     onClick={async () => {
                        connection = source('/api/csv?currentLeaseReport=true');
                        value = connection.select('message');
                        valueState = fromStore(value);
                        csv = connection.select('csv');
                        csvState = fromStore(csv);
                     }}
                  />
                  <div class='place-self-center'>
                     {valueState?.current}
                  </div>
               </div>
            {/snippet}
         </SearchDrawer>
         <div class="rounded-lg mt-14 sm:mt-10 mb-20 sm:mb-12 lg:mb-8">
            {#each slicedLeases(sortedByUnitNum(searchedLeases(searchByCustomer(leases, currentCustomers(customers))))) as lease}
            {@const customer = customers.find((customer) => customer.id === lease.customerId)}
            {@const leaseAddress = addresses.find((address) => address.addressId === lease.addressId)}
               <div class="grid sm:grid-cols-2 border border-primary-50-950 m-2 rounded-lg">
                  <LeaseEmployee lease={lease} classes='mx-2' open={true}/>
                  {#if customer}
                     <div class='m-2'> 
                        <UserEmployee user={customer} />
                        {#if leaseAddress}
                           <AddressEmployee address={leaseAddress} />
                        {/if}
                     </div>
                  {/if}
               </div>
            {/each}
         </div>
         <Pagination bind:size={size} bind:pageNum={pageNum} array={searchedLeases(leases)} label='leases'/>
      {/await}
   {/await}
{/await}