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

   let { data }: { data: PageData } = $props();
   const totalDiscounted = $derived((leases:Lease[]) => {
      let total = 0;
      for(const lease of leases){
         total += lease.discountedAmount ? lease.discountedAmount : 0
      }
      return total
   })
</script>
<Header title="Discounts" />
<div class="fixed top-9 w-screen bg-tertiary-50-950 rounded-b-lg">
   <Revenue amount={totalDiscounted(data.discountedLeases)} label='Total discounts' />
</div>
<div transition:fade={{duration:600}} class="mx-2 mt-18">
   <h3 class="h3">Current available Discounts</h3>
   {#each data.discounts as discount}
      <Discount {discount} classes='border border-primary-50-950 min-w-72 rounded-lg'/>
      <DiscountEndForm data={data.discountEndForm} discountId={discount.discountId}/>
   {/each}
   <HorizontalDivider />
   <div>
      <span>Currently Used discounts</span>
      {#each data.discountedLeases as lease}
      {@const user = data.customers.find((user) => lease.customerId === user.id)}
         <div class="border border-primary-50-950 rounded-lg">
            {#if user}
               <UserEmployee {user} classes='mx-2' />
            {/if}
            <LeaseEmployee {lease}/>
         </div>
      {/each}
   </div>
   <span>New discount</span>
   <NewDiscountForm data={data.newDiscountForm} />
</div>