<script lang="ts">
	import { Combobox, Modal } from '@skeletonlabs/skeleton-svelte';
   import type { PageData } from './$types';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

   let { data }: { data: PageData } = $props();
   interface ComboboxData {
      label: string;
      value: string;
   }
   const comboboxData:ComboboxData[] = [{
      label: 'All',
      value: 'all'
   }];
   for(const size of data.sizes){
      comboboxData.push({
         label: size.replace(/^0+/gm, '').replace(/x0/gm, 'x'),
         value: size
      })
   }
   let selectedSize = $state(['']);
</script>
<div class="mt-12 sm:mt-10 mx-2">
   <Combobox
      data={comboboxData}
      label='Select Size'
      value={selectedSize}
      onValueChange={(event) =>{
         if(browser){
            goto(`/units/size/${event.value[0]}`)
         }
      }}
      openOnClick={true}
   />
</div>