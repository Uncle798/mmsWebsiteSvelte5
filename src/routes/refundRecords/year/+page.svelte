<script lang="ts">
	import { Combobox, Progress, ProgressRing } from '@skeletonlabs/skeleton-svelte';
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
         openOnClick={true}
         onValueChange={(details) => {
            setTimeout(() => {
               delayed = true;
            }, 300)
            goto(`/refundRecords/year/${details.value[0]}`)
         }}
         zIndex='50'
      />
   {/if}
   {#if delayed}
      <ProgressRing  
         value={null} 
         size="size-8" 
         meterStroke="stroke-tertiary-600-400" 
         trackStroke="stroke-tertiary-50-950"
         classes='mt-6 mx-2'
         {@attach () => {
            setTimeout(() => {
               delayed = false;
               timeout = true;
            }, 700)
         }}
      />
   {/if}
   {#if timeout}
      <Progress 
         value={null}
         meterBg="bg-tertiary-500"
         width='w-12'
         classes='mt-9 mx-2'
      />
   {/if}
</div>