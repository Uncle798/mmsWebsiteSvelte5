<script lang="ts">
   import { Pagination } from '@skeletonlabs/skeleton-svelte';
   import User from '$lib/displayComponents/User.svelte';
	import EmploymentChangeForm from '$lib/forms/EmploymentChangeForm.svelte';
	import Header from '$lib/Header.svelte';
   import { createSearchStore, searchHandler } from '$lib/stores/search'
	import { superForm, superValidate } from 'sveltekit-superforms';
   import type { PageData } from './$types';
	import type { PartialUser } from '$lib/server/partialTypes';

   let { data = $bindable() }: { data: PageData } = $props();
   let {form:searchForm} = superForm(data.userSearchForm);
   let page = $state(1);
   let size = $state(25);
   let slicedSource = $derived((s:PartialUser[]) => s.slice((page-1)*size, page*size))
</script>
<Header title='All users' />

<form action="/users?/searchUsers" method="post">
   <input type="text" name="search" class="input" placeholder="Search by name" bind:value={$searchForm.search}>
   <button class="btn">Submit</button>
   <button class="btn" onclick={()=> $searchForm.search = ''}>Clear</button>
</form>
{#each slicedSource(data.users) as user (user.id)}
<div class="flex">
   <User user={user} />
   <EmploymentChangeForm 
      data={data.employmentChangeForm} 
      employeeChecked={user.employee} 
      adminChecked={user.admin}
      userId={user.id}
   />
</div>
{/each}
<footer class="flex justify-between">
   <select name="size" id="size" class="select" bind:value={size}>
      {#each [5,10,25,50] as v}
         <option value={v}>Show {v} users per page</option>
      {/each}
         <option value={data.users.length}>Show all {data.users.length} users</option>
   </select>
   <Pagination data={data.users} bind:page bind:pageSize={size} count={data.users.length} alternative/>
</footer>