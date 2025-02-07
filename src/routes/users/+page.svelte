<script lang="ts">
   import Pagination from '$lib/displayComponents/Pagination.svelte';
	import EmploymentChangeForm from '$lib/forms/EmploymentChangeForm.svelte';
	import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';
	import type { PartialUser } from '$lib/server/partialTypes';
   import { fade } from 'svelte/transition';
	import UserAdmin from '$lib/displayComponents/UserAdmin.svelte';
	import Search from '$lib/forms/Search.svelte';
	import User from '$lib/displayComponents/User.svelte';
	import HorizontalDivider from '$lib/displayComponents/HorizontalDivider.svelte';
	import VerticalDivider from '$lib/displayComponents/VerticalDivider.svelte';

   let { data }: { data: PageData } = $props();
   let search = $state('')
   let pageNum = $state(1);
   let size = $state(25);
   
   let slicedSource = $derived((users:PartialUser[]) => users.slice((pageNum-1)*size, pageNum*size));
   let searchedUsers = $derived((users:PartialUser[]) => 
      users.filter((user) => {
         return user.givenName?.toLowerCase().includes(search.toLowerCase()) ||
         user.familyName?.toLowerCase().includes(search.toLowerCase());
      })
   )
</script>
<Header title='All users' />
{#await data.users}
   ...loading users
{:then users }
   <div transition:fade={{duration:600}}>
      <Search data={data.searchForm} bind:search={search} searchType='user' />
      {#each slicedSource(searchedUsers(users)) as user (user.id)}
         <div class="flex">
            <UserAdmin user={user} widthClass='w-1/3' />
            <VerticalDivider classes='h-30' />
            <EmploymentChangeForm 
               data={data.employmentChangeForm} 
               employeeChecked={user.employee} 
               adminChecked={user.admin}
               userId={user.id}
            />
         </div>
         <HorizontalDivider />
      {/each}
         <Pagination bind:size={size} bind:pageNum={pageNum} array={searchedUsers(users)} label='users'/>
   </div>
{/await}