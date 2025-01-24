<script lang="ts">
   import { Pagination } from '@skeletonlabs/skeleton-svelte';
	import EmploymentChangeForm from '$lib/forms/EmploymentChangeForm.svelte';
	import Header from '$lib/Header.svelte';
	import { superForm, } from 'sveltekit-superforms';
   import type { PageData } from './$types';
	import type { PartialUser } from '$lib/server/partialTypes';
	import { goto } from '$app/navigation';
   import { fade } from 'svelte/transition';
	import UserAdmin from '$lib/displayComponents/UserAdmin.svelte';

   let { data }: { data: PageData } = $props();
   let search = $state('')
   let {form:searchForm, enhance} = superForm(data.searchForm, {
      onChange(event) {
         search = event.get('search')
      },
   });
   let pageNum = $state(1);
   let size = $state(25);
   let slicedSource = $derived((s:PartialUser[]) => s.slice((pageNum-1)*size, pageNum*size));
   let filteredList = $derived((f:PartialUser[]) => f.filter(user => user.familyName?.toLowerCase().includes(search.toLowerCase())))
</script>
<Header title='All users' />
{#await data.users}
   ...loading users
{:then users }
<div transition:fade={{duration:600}}>
   <div class="m-4 card">
      <form method="post"  use:enhance>
         <input type="text" name="search" class="input" placeholder="Search by family name" bind:value={$searchForm.search}>
         <button class="btn">Submit</button>
         <button class="btn" onclick={()=> {search=''; $searchForm.search = ''}}>Clear</button>
      </form>
   </div>
      {#each slicedSource(filteredList(users)) as user (user.id)}
   <div class="flex">
      <UserAdmin user={user} />
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
         <option value={filteredList(users).length}>Show all {filteredList(users).length} users</option>
      </select>
      <Pagination data={filteredList(users)} bind:page={pageNum} bind:pageSize={size} alternative/>
   </footer>
</div>
{/await}