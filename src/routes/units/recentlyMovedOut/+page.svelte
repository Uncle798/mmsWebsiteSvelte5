<script lang="ts">
   import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
	import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import UnitNotesForm from '$lib/forms/UnitNotesForm.svelte';
   import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();
</script>

<Header title='Recently Moved Out' />

{#await data.units}
   <div class="mt-10">
      Loading units...
   </div>
{:then units}
   {#await data.leases}
      <div class="mt-10">
         Loading leases...
      </div>
   {:then leases} 
      <div class="grid grid-cols-1 gap-1 mt-10">
         {#each units as unit}
         {@const unitLeases = leases.filter((lease) => lease.unitNum === unit.num)}
            <div class="mx-2 border border-primary-50-950 rounded-lg">
               <UnitEmployee {unit} classes=''/>
               <UnitNotesForm data={data.unitNotesForm} {unit} classes='mx-1'/>
               {#each unitLeases as lease}
                  <LeaseEmployee {lease} />
               {/each}
            </div>
         {/each}
      </div>
   {/await}
{/await}