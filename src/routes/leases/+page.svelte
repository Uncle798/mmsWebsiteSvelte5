<script lang="ts">
   import Header from '$lib/Header.svelte';
	import type { User, Lease } from '@prisma/client';
   import type { PageData } from './$types';
	import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import Search from '$lib/forms/Search.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { SearchIcon, PanelTopClose } from 'lucide-svelte';
   let { data }: { data: PageData } = $props();
   let search = $state('')
   let pageNum = $state(1);
   let size = $state(25);
   let searchedLeases = $derived((leases:Lease[]) => leases.filter((lease) => lease.leaseId.includes(search)))
   let slicedLeases = $derived((leases:Lease[]) => leases.slice((pageNum-1)*size, pageNum*size));
   let customers = $state<User[]>();
   const wrapper = new Promise<User[]>(async res => {
      customers = await data.customers
      res(customers)
   })
   const searchByCustomer = $derived((leases:Lease[]) => {
      const filteredCustomers = customers!.filter((customer) => {
         return customer.familyName?.includes(search) || customer.givenName?.includes(search)
      })
      const returnedLeases:Lease[] =[];
      for(const customer of filteredCustomers){
         const customerLeases = leases.filter((lease) => lease.customerId === customer.id)
         for(const cL of customerLeases){
            returnedLeases.push(cL)
         }
      }
      return returnedLeases
   })
   let customerSearch = $state('')
   let searchDrawerOpen = $state(false)
</script>
<Header title='All leases' />

{#await data.leases}
   <div class="mt-14 sm:mt-10">
      Loading {data.leaseCount} leases...
   </div>
{:then leases}
   {#await wrapper}
      <div class="mt-14 sm:mt-10 mx-1">
         Loading customers...
      </div>
   {:then customers} 
      {#await data.addresses}
         <div class="mt-14 sm:mt-10 mx-1">
            Loading addresses...
         </div>
      {:then addresses}
         <Modal
            open={searchDrawerOpen}
            onOpenChange={(event)=>(searchDrawerOpen = event.open)}
            triggerBase='btn preset-filled-primary-50-950 rounded-lg fixed top-0 right-0 z-50'
            contentBase='bg-surface-100-900 h-[240px] w-screen rounded-lg'
            positionerJustify=''
            positionerAlign=''
            positionerPadding=''
            transitionsPositionerIn={{y:-240, duration: 600}}
            transitionsPositionerOut={{y:-240, duration: 600}}
            modal={false}
         >
            {#snippet trigger()}
               <SearchIcon aria-label='Close'/>
            {/snippet}
            {#snippet content()}
               <button onclick={()=>searchDrawerOpen=false} class='btn preset-filled-primary-50-950 rounded-lg m-1 absolute top-0 right-0'><PanelTopClose aria-label='Close'/></button>
               <Search search={search} searchType='lease id' data={data.searchForm} classes='mt-14 sm:mt-10 mx-1'/>
               <Search search={customerSearch} searchType='customer name' data={data.searchForm} classes='mx-1' />
            {/snippet}
         </Modal>
         <div class="rounded-lg mt-14 sm:mt-10">
            {#each slicedLeases(searchByCustomer(searchedLeases(leases))) as lease}
            {@const customer = customers.find((customer) => customer.id === lease.customerId)}
            {@const leaseAddress = addresses.find((address) => address.addressId === lease.addressId)}
               <div class="grid sm:grid-cols-2 border border-primary-50-950 m-2 rounded-lg">
                  <LeaseEmployee lease={lease} classes='mx-2'/>
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