<script lang="ts">
   import User from '$lib/displayComponents/User.svelte';
	import EmploymentChangeForm from '$lib/forms/EmploymentChangeForm.svelte';
	import Header from '$lib/Header.svelte';
   import { createSearchStore, searchHandler } from '$lib/stores/search'
	import { superForm, superValidate } from 'sveltekit-superforms';
   import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();
   let {form:searchForm} = superForm(data.userSearchForm);
</script>
<Header title='All users' />
Showing {data.users.length} of {data.userCount}
<form action="/users?/searchUsers" method="post">
   <input type="text" name="search" class="input" placeholder="Search by name" bind:value={$searchForm.search}>
   <button class="btn">Submit</button>
</form>
{#each data.users as user (user.id)}
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