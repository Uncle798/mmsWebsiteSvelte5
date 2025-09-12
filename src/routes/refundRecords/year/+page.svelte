<script lang="ts">
	import { Combobox } from '@skeletonlabs/skeleton-svelte';
   import type { PageData } from './$types';
	import { goto } from '$app/navigation';

   let { data }: { data: PageData } = $props();
   interface ComboboxData {
      label: string;
      value: string;
   }
   let yearComboboxData:ComboboxData[] = $derived(data.years.map(year => ({
		label: year.toString(),
		value: year.toString()
	})))
</script>
<div class="mt-14 sm:mt-12 mx-1 sm:mx-2">
   {#if data.years}
      <Combobox
         data={yearComboboxData}
         label='Select year'
         placeholder='Select year...'
         openOnClick={true}
         onValueChange={(details) => {
            goto(`/refundRecords/year/${details.value[0]}`)
         }}
         zIndex='50'
      />
   {/if}
</div>