<script lang="ts">
    import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
    import User from '$lib/displayComponents/User.svelte';
	import { superForm } from 'sveltekit-superforms';
    import type { PageData } from './$types';
	import Header from '$lib/Header.svelte';
    import { goto } from '$app/navigation';
    import type { PartialUser } from '$lib/server/partialTypes';
    import Pagination from '$lib/displayComponents/Pagination.svelte';
	import { fade } from 'svelte/transition';
	import Search from '$lib/forms/Search.svelte';
	import HorizontalDivider from '$lib/displayComponents/HorizontalDivider.svelte';
	import VerticalDivider from '$lib/displayComponents/VerticalDivider.svelte';
	import Revenue from '$lib/displayComponents/Revenue.svelte';
	import type { Lease } from '@prisma/client';

    let { data }: { data: PageData } = $props();
    const { customers } = data;
    let { form, enhance} = superForm(data.userSearchForm, {
      onSubmit(input) {
         input.cancel()
         const search = input.formData.get('search')?.toString();
         if(search){
            goto(`/users?search=${search}`)
         }
      },
   });
   let pageNum = $state(1);
   let size = $state(25);
   let search = $state('');
   let slicedSource = $derived((s:PartialUser[]) => s.slice((pageNum-1)*size, pageNum*size));
   let searchedSource = $derived((customers:PartialUser[]) => customers.filter((customer) => customer.familyName?.includes(search)))
   const totalLeased = $derived((leases:Lease[]) => {
      let totalLeased = 0;
      leases.forEach((lease) => {
         totalLeased += lease.price
      });
      return totalLeased
   })
</script>
<Header title='Current Customers'/>
{#await data.customers}
    ...loading {data.customerCount} customers
{:then customers}
   {#await data.leases}
      loading leases...
   {:then leases} 
      <div transition:fade={{duration:600}}>
         <Search search={search} searchType='customer name' data={data.userSearchForm} classes='m-2 border-b-2 border-primary-50 dark:border-primary-950'/>
         <Revenue label='Current monthly invoiced' amount={totalLeased(leases)} classes='m-2 border-b-2 border-primary-50 dark:border-primary-950'/>
         <div class="grid grid-cols-2 mx-2 gap-y-3 gap-x-1">
            {#each slicedSource(searchedSource(customers)) as customer}
            {@const lease = leases.find((lease) => lease.customerId === customer.id)}
               <User user={customer} classes='border-2 rounded-lg border-primary-50 dark:border-primary-950 p-2'/>
               {#if lease}
                  <LeaseEmployee {lease} classes='border-2 rounded-lg border-primary-50 dark:border-primary-950 p-2'/>
               {/if}
            {/each}
         </div>
         <Pagination bind:pageNum={pageNum} bind:size={size} label='users' array={searchedSource(customers)}/>
      </div>
   {/await}
{/await}