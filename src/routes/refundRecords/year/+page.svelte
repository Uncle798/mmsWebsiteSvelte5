<script lang="ts">
	import Combobox from '$lib/formComponents/Combobox.svelte';
   import ProgressLine from '$lib/displayComponents/ProgressLine.svelte';
   import ProgressRing from '$lib/displayComponents/ProgressRing.svelte';
   import type { PageData } from './$types';
	import { goto, onNavigate } from '$app/navigation';
   
   let { data }: { data: PageData } = $props();
   interface ComboboxData {
      label: string;
      value: string;
   }
   let yearComboboxData:ComboboxData[] = $derived(data.years.map(year => ({
		label: year.toString(),
		value: year.toString()
	})))
   let delayed = $state(false);
   let timeout = $state(false);
   onNavigate(()=>{
      delayed = false;
      timeout = false;
   })
</script>
<div class="mt-14 sm:mt-12 mx-1 sm:mx-2 flex flex-row">
   {#if data.years}
      <Combobox
         data={yearComboboxData}
         label='Select year'
         placeholder='Select year...'
         onValueChange={(details) => {
            setTimeout(() => {
               delayed = true;
            }, 300)
            goto(`/refundRecords/year/${details.value[0]}`)
         }}
      />
   {/if}
   {#if delayed}
      <ProgressRing  
         value={null}
         {@attach () => {
            setTimeout(() => {
               delayed = false;
               timeout = true;
            }, 700)
         }}
      />
   {/if}
   {#if timeout}
      <ProgressLine value={null} />
   {/if}
</div>