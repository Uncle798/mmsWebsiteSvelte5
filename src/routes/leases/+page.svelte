<script lang="ts">
   import Header from '$lib/Header.svelte';
	import type { Lease } from '@prisma/client';
   import type { PageData } from './$types';
	import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import Search from '$lib/forms/Search.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
   let { data }: { data: PageData } = $props();
   let search = $state('')
   let pageNum = $state(1);
   let size = $state(25);
   let searchedLeases = $derived((leases:Lease[]) => leases.filter((lease) => lease.leaseId.includes(search)))
   let slicedLeases = $derived((leases:Lease[]) => leases.slice((pageNum-1)*size, pageNum*size));
</script>
<Header title='All leases' />

{#await data.leases}
   loading {data.leaseCount} leases
{:then leases}
   {#await data.customers}
      loading customers
   {:then customers} 
      <Search search={search} searchType='lease id' data={data.searchForm} />
      {#each slicedLeases(searchedLeases(leases)) as lease}
         {@const customer = customers.find((customer) => customer.id === lease.customerId)}
         <div class="flex">
            <LeaseEmployee lease={lease} />
            {#if customer}
               <UserEmployee user={customer} />
            {/if}
         </div>
      {/each}
      <Pagination bind:size={size} bind:pageNum={pageNum} array={searchedLeases(leases)} label='leases'/>
   {/await}
{/await}