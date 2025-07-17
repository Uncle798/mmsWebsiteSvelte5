<script lang="ts">
	import { goto } from '$app/navigation';
    import type { PageData } from './$types';
    import {Combobox } from '@skeletonlabs/skeleton-svelte'
    let { data }: { data: PageData } = $props();
    let yearSelect = $state(['']);
   interface ComboboxData {
      label: string;
      value: string;
   }
   let yearComboboxData:ComboboxData[] = [
      {label:'Unpaid Invoices', value: 'unpaid'},
   ]
   data.years.forEach((year) => {
      yearComboboxData.push({label:year.toString(), value: year.toString()})
   })
</script>
<div class="mx-1 sm:mx-2 mt-14 sm:mt-10 ">
    {#if data.years}
        <Combobox
        data={yearComboboxData}
        value={yearSelect}
        label='Select year'
        placeholder='Select year ...'
        openOnChange={true}
        onValueChange={(details) => {
            goto(`/paymentRecords/year/${details.value[0]}`)
        }}
        zIndex='50'
        />
    {/if}
</div>