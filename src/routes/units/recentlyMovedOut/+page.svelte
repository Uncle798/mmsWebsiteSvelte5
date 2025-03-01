<script lang="ts">
   import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();
</script>

<Header title='Recently Moved Out' />

{#await data.leases}
   <div class="mt-8">
      loading units...
   </div>
{:then leases} 
   <div class="mt-8">
      {#each leases as lease}
         <LeaseEmployee {lease} />
      {/each}
   </div>
{/await}