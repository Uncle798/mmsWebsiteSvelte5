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
</script>
<Header title='Current Customers'/>
{#await data.customers}
    ...loading {data.customerCount} customers
{:then customers}
   <div transition:fade={{duration:600}}>
      <Search search={search} searchType='customer' data={data.userSearchForm}/>
      {#each slicedSource(searchedSource(customers)) as customer}
      {@const leases = data.leases.filter((lease) => lease.customerId === customer.id)}
         <div class="flex card">
            <User user={customer} />
            {#each leases as lease}
               <LeaseEmployee lease={lease} />
            {/each}
         </div>
      {/each}()
      <Pagination bind:pageNum={pageNum} bind:size={size} label='users' array={searchedSource(customers)}/>
   </div>
{/await}