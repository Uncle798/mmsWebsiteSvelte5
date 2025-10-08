<script lang="ts">
	import { goto, onNavigate } from '$app/navigation';
   import type { PageData } from './$types';
   import Combobox from '$lib/formComponents/Combobox.svelte';
   import ProgressLine from '$lib/displayComponents/ProgressLine.svelte';
   import ProgressRing from '$lib/displayComponents/ProgressRing.svelte';
   let { data }: { data: PageData } = $props();
   interface ComboboxData {
      label: string;
      value: string;
   }
   let yearComboboxData:ComboboxData[] = $derived(data.years.map(year => ({
      label: year.toString(),
      value: year.toString()
   })));
   let navDelayed = $state(false);
   let navTimeout = $state(false);
   onNavigate(() => {
      navDelayed = false;
      navTimeout = false;
   })
</script>
<div class="mx-1 sm:mx-2 mt-14 sm:mt-10">
   {#if data.years}
      <Combobox
         data={yearComboboxData}
         label='Select year'
         placeholder='Select year ...'
         onValueChange={(details) => {
            setTimeout(() => {
               navDelayed = true;
            }, 300);
            goto(`/paymentRecords/year/${details.value[0]}`);
         }}
      />
   {/if}
   {#if navDelayed}
      <ProgressRing  
         value={null} 
         {@attach () => {
            setTimeout(() => {
               navDelayed = false;
               navTimeout = true;
            }, 800)
         }}
      />
   {/if}
   {#if navTimeout}
      <ProgressLine value={null} />
   {/if}
</div>