<script lang="ts">
   import Combobox from '$lib/formComponents/Combobox.svelte';
   import ProgressLine from '$lib/displayComponents/ProgressLine.svelte';
   import ProgressRing from '$lib/displayComponents/ProgressRing.svelte';
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
   let delayed = $state(false);
   let timeout = $state(false);
</script>
<div class="mt-14 sm:mt-10 mx-2 flex flex-row">
   <Combobox
      data={comboboxData}
      label='Select Size'
      onValueChange={(event) =>{
         setTimeout(() => {
            delayed = true
         }, 400)
         if(browser && event.value[0] === 'all'){
            goto('/units')
         } else if(browser){
            goto(`/units/size/${event.value[0]}`)
         }
      }}
      placeholder='Select or type'
   />
   {#if delayed}
      <ProgressRing  
         value={null} 
         {@attach () => {
            setTimeout(() => {
               delayed = false;
               timeout = true;
            }, 800)
         }}
      />
   {/if}
   {#if timeout}
      <ProgressLine value={null} />
   {/if}
</div>