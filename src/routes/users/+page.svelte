<script lang="ts">
   import Pagination from '$lib/displayComponents/Pagination.svelte';
	import EmploymentChangeForm from '$lib/forms/EmploymentChangeForm.svelte';
	import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';
	import type { PartialUser } from '$lib/server/partialTypes';
   import { fade } from 'svelte/transition';
	import UserAdmin from '$lib/displayComponents/UserAdmin.svelte';
	import Search from '$lib/forms/Search.svelte';
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
   ...loading {data.userCount} users
{:then users }
   <div transition:fade={{duration:600}} class="m-2 mt-10">
      <Search data={data.searchForm} bind:search={search} searchType='user' />
      <div class="grid grid-cols-1 gap-y-3 gap-x-1">
         {#each slicedSource(searchedUsers(users)) as user (user.id)}
            <div class="rounded-lg border border-primary-50 dark:border-primary-950 flex flex-row">
               <UserAdmin {user} classes=" p-2 w-1/2"/>
               <EmploymentChangeForm 
                  data={data.employmentChangeForm} 
                  employeeChecked={user.employee} 
                  adminChecked={user.admin}
                  userId={user.id}
                  classes=" p-2 flex flex-col sm:flex-row"
               />
            </div>
         {/each}
      </div>
      <Pagination bind:size={size} bind:pageNum={pageNum} array={searchedUsers(users)} label='users'/>
   </div>
{/await}