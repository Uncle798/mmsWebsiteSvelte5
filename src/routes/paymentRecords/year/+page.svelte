<script lang="ts">
   import { goto, onNavigate } from '$app/navigation';
   import type { PageData } from './$types';
   import {Combobox, Progress, ProgressRing } from '@skeletonlabs/skeleton-svelte'
   let { data }: { data: PageData } = $props();
   let yearSelect = $state(['']);
   interface ComboboxData {
      label: string;
      value: string;
   }
   let yearComboboxData:ComboboxData[] = $derived(data.years.map(year => ({
      label: year.toString(),
      value: year.toString()
   }))) 
   let navDelayed = $state(false);
   let navTimeout = $state(false);
   onNavigate(() => {
      navDelayed = false;
      navTimeout = false;
   })
</script>
<div class="mx-1 sm:mx-2 mt-14 sm:mt-10 flex flex-row w-screen ">
   {#if data.years}
      <Combobox
         data={yearComboboxData}
         value={yearSelect}
         label='Select year'
         placeholder='Select year...'
         openOnClick={true}
         onValueChange={(details) => {
            setTimeout(() => {
               navDelayed = true
            }, 300);
            goto(`/paymentRecords/year/${details.value[0]}`)
         }}
         zIndex='50'
         width='w-11/12'
      />
   {/if}
   {#if navDelayed}
      <ProgressRing  
         value={null} 
         size="size-8" 
         meterStroke="stroke-tertiary-600-400" 
         trackStroke="stroke-tertiary-50-950"
         classes='mt-6 mx-2'
         {@attach () => {
            setTimeout(() => {
               navDelayed = false;
               navTimeout = true;
            }, 800)
         }}
      />
   {/if}
   {#if navTimeout}
      <Progress 
         value={null}
         meterBg="bg-tertiary-500"
         width='w-12'
         classes='mt-9 mx-2'
      />
   {/if}
</div>