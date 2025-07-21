<script lang="ts">
   import Pagination from '$lib/displayComponents/Pagination.svelte';
	import EmploymentChangeForm from '$lib/forms/EmploymentChangeForm.svelte';
	import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';
   import type { User } from '@prisma/client';
   import { fade } from 'svelte/transition';
	import UserAdmin from '$lib/displayComponents/UserAdmin.svelte';
	import Search from '$lib/forms/Search.svelte';
	import { Modal, Switch } from '@skeletonlabs/skeleton-svelte';
	import { SearchIcon, PanelTopClose, Users } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import ExplainerModal from '$lib/demo/ExplainerModal.svelte';

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
   let employeeFilter = $state(false)
</script>
<Header title='All users' />
{#await data.users}
   <div class="mt-14 sm:mt-10">
      Loading {data.userCount} users...
   </div>
{:then users }
   <Modal
      open={searchDrawerOpen}
      onOpenChange={(event)=>(searchDrawerOpen = event.open)}
      triggerBase='btn preset-filled-primary-50-950 rounded-lg fixed top-0 right-0 z-50 h-12 sm:h-auto'
      contentBase='bg-surface-100-900 h-[180px] w-screen rounded-b-lg '
      positionerJustify=''
      positionerAlign=''
      positionerPadding=''
      transitionsPositionerIn={{y:-180, duration: 600}}
      transitionsPositionerOut={{y:-180, duration: 600}}
      modal={false}
   >
      {#snippet trigger()}
         <SearchIcon aria-label='Search' />
      {/snippet}
      {#snippet content()}
      <div class="mx-2 mt-11">
         <button onclick={()=>searchDrawerOpen=false} class='btn preset-filled-primary-50-950 rounded-lg m-1 absolute top-0 right-0 h-12 sm:h-auto'><PanelTopClose aria-label='Close'/></button>
         <Search data={data.searchForm} bind:search={search} searchType='user' />
         <div>
            Filter by 
            <Switch
               checked={employeeFilter}
               onCheckedChange={(e) => employeeFilter = e.checked}
               name='employeeFilter'
               label='Employee filter'
            >
               Employee
            </Switch>
            <Switch
               checked={adminFilter}
               onCheckedChange={(e) => adminFilter = e.checked}
               name='adminFilter'
               label='Admin filter'
            >
               Admin
            </Switch>
         </div>
      </div>
      {/snippet}
   </Modal>
   <ExplainerModal
      bind:modalOpen={explainerModalOpen}
   >
      {#snippet copy()}
         Admins can change the employment status of a user, Employees can't, otherwise they're the same. All Admins should also be employees.
      {/snippet}
   </ExplainerModal>
   <div in:fade={{duration:600}} class="m-2 mt-14 sm:mt-10">
      <div class="grid grid-cols-1 gap-y-3 gap-x-1">
         {#each slicedSource(searchedUsers(filterAdmin(filterEmployee(users)))) as user (user.id)}
            <div class="rounded-lg border border-primary-50-950 flex flex-col sm:flex-row">
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