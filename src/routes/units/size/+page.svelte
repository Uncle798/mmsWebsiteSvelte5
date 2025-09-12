<script lang="ts">
	import { Combobox, Modal } from '@skeletonlabs/skeleton-svelte';
   import type { PageData } from './$types';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

   let { data }: { data: PageData } = $props();
   interface ComboboxData {
      label: string;
      value: string;
   }
   const comboboxData:ComboboxData[] = $derived(data.sizes.map(size => ({
      label: size.replace(/^0+/gm, '').replace(/x0/gm, 'x'),
      value: size
   })))
   onMount(() => {
      comboboxData.unshift({label: 'All', value: 'all'})
   })
</script>
<div class="mt-14 sm:mt-10 mx-2">
   <Combobox
      data={comboboxData}
      label='Select Size'
      onValueChange={(event) =>{
         if(browser && event.value[0] === 'all'){
            goto('/units')
         } else if(browser){
            goto(`/units/size/${event.value[0]}`)
         }
      }}
      placeholder='Select or type'
      openOnClick={true}
   />
</div>