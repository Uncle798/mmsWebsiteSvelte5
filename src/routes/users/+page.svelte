<script lang="ts">
   import Pagination from '$lib/displayComponents/Pagination.svelte';
	import EmploymentChangeForm from '$lib/forms/EmploymentChangeForm.svelte';
	import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';
   import type { User } from '@prisma/client';
   import { fade } from 'svelte/transition';
	import UserAdmin from '$lib/displayComponents/UserAdmin.svelte';
	import Search from '$lib/forms/Search.svelte';
	import Switch from '$lib/formComponents/Switch.svelte';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import SearchDrawer from '$lib/displayComponents/Modals/SearchDrawer.svelte';
   import { driver } from 'driver.js';
   import 'driver.js/dist/driver.css';

   let { data }: { data: PageData } = $props();
   let search = $state('')
   let pageNum = $state(1);
   let size = $state(25);
   
   let slicedSource = $derived((users:User[]) => users.slice((pageNum-1)*size, pageNum*size));
   let searchedUsers = $derived((users:User[]) => 
      users.filter((user) => {
         return user.givenName?.toLowerCase().includes(search.toLowerCase()) ||
         user.familyName?.toLowerCase().includes(search.toLowerCase());
      })
   )
   const filterAdmin = $derived((users:User[]) => {
      if(adminFilter){
         return users.filter((user) =>{
            return user.admin === true
         })
      } else {
         return users;
      }
   });
   const filterEmployee = $derived((users:User[]) => {
      if(employeeFilter){
         return users.filter((user) => {
            return user.employee === true
         })
      } else {
         return users;
      }
   })
   let searchDrawerOpen = $state(false);
   let explainerModalOpen = $state(true);
   onMount(()=>{
      setTimeout(()=>(
         explainerModalOpen = false
      ), 5000)
   })
   let adminFilter = $state(false);
   let employeeFilter = $state(false);
   async function deleteUser(userId:string) {
      await fetch('/api/users', {
         method: 'DELETE',
         body: JSON.stringify({userId})
      })
      invalidateAll();
   }
   const userTour = driver({
      showProgress: true,
      stagePadding: 2,
      steps: [
         { popover: { title: `Admin all user page`, description: `Welcome to the admin user page. Here is where you add or remove employees and other admins.`}},
         { element: '.firstUserEmployment', popover:{ title: `Employee and admin`, description: `Admins can change employment status, employees can't, all admins should also be employees`}}
      ],
      onDestroyed: () => {
         fetch('/api/demoSetCookie?demoPage=users')
      }
   })
   onMount(() => {
      if(data.demoCookie !== 'true'){
         userTour.drive()
      }
   })
</script>
<Header title='All users' />
{#await data.users}
   <div class="mt-14 sm:mt-10 mx-1 sm:mx-2">
      Loading {data.userCount} users...
   </div>
{:then users }
   <SearchDrawer modalOpen={searchDrawerOpen} height='h-[180px]'>
      {#snippet content()}
         <Search data={data.searchForm} bind:search={search} searchType='user' />
         <div>
            Filter by 
            <Switch
               checked={employeeFilter}
               name='employeeFilter'
               label='Employee filter'
            />
            <Switch
               checked={adminFilter}
               name='adminFilter'
               label='Admin filter'
            />
         </div>
      {/snippet}
   </SearchDrawer>
   <div in:fade={{duration:600}} class="m-2 mt-14 sm:mt-10">
      <div class="grid grid-cols-1 gap-y-3 gap-x-1">
         {#each slicedSource(searchedUsers(filterAdmin(filterEmployee(users)))) as user, i (user.id)}
            {#if i === 0}               
               <div class="rounded-lg border border-primary-50-950 flex flex-col sm:flex-row firstUser">
                  <UserAdmin {user} classes=" p-2 w-1/2"/>
                  <div>
                     <EmploymentChangeForm 
                     data={data.employmentChangeForm} 
                     employeeChecked={user.employee} 
                     adminChecked={user.admin}
                     userId={user.id}
                     classes="flex flex-col sm:flex-row firstUserEmployment"
                     />
                     <button class="btn preset-filled-primary-50-950 h-8 mb-2" onclick={()=> deleteUser(user.id)}>Delete User</button>
                  </div>
               </div>
            {:else}
               <div class="rounded-lg border border-primary-50-950 flex flex-col sm:flex-row">
                  <UserAdmin {user} classes=" p-2 w-1/2"/>
                  <div>
                     <EmploymentChangeForm 
                     data={data.employmentChangeForm} 
                     employeeChecked={user.employee} 
                     adminChecked={user.admin}
                     userId={user.id}
                     classes="flex flex-col sm:flex-row"
                     />
                     <button class="btn preset-filled-primary-50-950 h-8 mb-2" onclick={()=> deleteUser(user.id)}>Delete User</button>
                  </div>
               </div>
            {/if}
         {/each}
         </div>
      <Pagination bind:size={size} bind:pageNum={pageNum} array={searchedUsers(users)} label='users'/>
   </div>
{/await}