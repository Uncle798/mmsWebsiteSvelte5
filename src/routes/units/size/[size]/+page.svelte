<script lang="ts">
   import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();
</script>
<Header title='All {data.size} units' />
{#each data.units as unit} 
   {@const {lease} = unit }
   <div class="flex">
      <UnitEmployee unit={unit}/>
      {#each lease as l}
      <LeaseEmployee lease={l} />
      {/each}
   </div>
{/each} 