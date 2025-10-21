<script lang="ts">
   import Discount from '$lib/displayComponents/Discount.svelte';
	import DiscountEndForm from '$lib/forms/DiscountEndForm.svelte';
	import NewDiscountForm from '$lib/forms/NewDiscountForm.svelte';
	import Header from '$lib/Header.svelte';
	import { fade } from 'svelte/transition';
   import type { PageData } from './$types';
	import HorizontalDivider from '$lib/displayComponents/HorizontalDivider.svelte';
	import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import Revenue from '$lib/displayComponents/Revenue.svelte';
	import type { Lease } from '@prisma/client';
	import { onMount } from 'svelte';
   import { driver } from 'driver.js';
   import 'driver.js/dist/driver.css';
	import { Collapsible } from '@skeletonlabs/skeleton-svelte';

   let { data }: { data: PageData } = $props();
   const totalDiscounted = $derived((leases:Lease[]) => {
      let total = 0;
      for(const lease of leases){
         total += lease.discountedAmount ? lease.discountedAmount : 0
      }
      return total
   })
   const discountsTour = driver({
      showProgress: true,
      stagePadding: 2,
      steps: [
         { popover: { title: `Discounts`, description: `Want to give all non-profits $5 off? Want to give Terry down the street a good deal? Manage that here. Set discounts by percentage or a flat amount off.`}},
         { element: '.discountRevenue', popover: { title: `Total discounts`, description: `This is the total amount per month difference from advertised price.`}},
         { element: '.currentlyAvailable', popover: { title: `Current Discounts`, description: `Here's currently running discounts`}},
         { element: '.currentDiscounted', popover: { title: `Currently discounted`, description: `Quickly see who has a discounted unit.`}},
         { element: '.newDiscount', popover: { title: `New Discount`, description: `Make a new discount`}}
      ],
      onDestroyed: () => {
         fetch('/api/demoSetCookie?demoPage=discounts')
      }
   })
   onMount(()=>{
      if(data.demoCookie !== 'true'){
         discountsTour.drive()
      }
   })
</script>
<Header title="Discounts" />
<div class="fixed top-12 sm:top-8 w-screen bg-tertiary-50-950 rounded-b-lg">
   <Revenue amount={totalDiscounted(data.discountedLeases)} label='Total discounts' classes='discountRevenue' />
</div>
<div in:fade={{duration:600}} out:fade={{duration:0}} class="mx-2 mt-18 mb-8">
   <div class="currentlyAvailable">
      <h3 class="h3">Current available Discounts</h3>
      {#each data.discounts as discount}
         <Discount {discount} classes='border border-primary-50-950 min-w-72 rounded-lg'/>
         <DiscountEndForm data={data.discountEndForm} discountId={discount.discountId}/>
      {/each}

   </div>
   <HorizontalDivider />
   <div class="currentDiscounted">
      <h3 class="h3">Currently Used discounts</h3>
      {#each data.discountedLeases as lease}
      {@const user = data.customers.find((user) => lease.customerId === user.id)}
         <div class="border border-primary-50-950 rounded-lg my-2">
            <Collapsible class='p-2'>
               <Collapsible.Trigger>
                  {#if user}
                     <UserEmployee {user} classes=' text-left' />
                  {/if}
               </Collapsible.Trigger>
               <Collapsible.Content>
                  <LeaseEmployee {lease}/>
               </Collapsible.Content>
            </Collapsible>
         </div>
      {/each}
   </div>
   <HorizontalDivider />
   <div class="newDiscount">
      <h3 class="h3">New discount</h3>
      <NewDiscountForm data={data.newDiscountForm} />
   </div>
</div>