<script lang="ts">
   import { Pagination } from '@skeletonlabs/skeleton-svelte';
   import User from '$lib/displayComponents/User.svelte';
	import EmploymentChangeForm from '$lib/forms/EmploymentChangeForm.svelte';
	import Header from '$lib/Header.svelte';
	import { superForm, } from 'sveltekit-superforms';
   import type { PageData } from './$types';
	import type { PartialUser } from '$lib/server/partialTypes';
	import { goto } from '$app/navigation';
   import { fade } from 'svelte/transition';

   let { data }: { data: PageData } = $props();
   let {form:searchForm, enhance} = superForm(data.searchForm, {
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
   let slicedSource = $derived((s:PartialUser[]) => s.slice((pageNum-1)*size, pageNum*size));
</script>
<Header title='All users' />
{#if !data.users}
   ...loading users
{:else }
<div transition:fade={{duration:600}}>

   <form method="post" use:enhance>
      <input type="text" name="search" class="input" placeholder="Search by name" bind:value={$searchForm.search}>
      <button class="btn">Submit</button>
      <button class="btn" onclick={()=> goto('/users', {invalidateAll: true})}>Clear</button>
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
      <Pagination data={data.users} bind:page={pageNum} bind:pageSize={size} alternative/>
   </footer>
</div>
{/if}