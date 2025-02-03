<script lang="ts">
	import VerticalDivider from '$lib/displayComponents/VerticalDivider.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>
{#await data.sizes}
   loading units
   {:then sizes} 
   <div class="flex">
      Please select size:
      <VerticalDivider classes='h-10' />
      {#each sizes as size}
         <a href="/units/size/{size}" class="btn">{size.replace(/^0+/gm, '').replace(/x0/gm,'x')}</a>
         <VerticalDivider classes='h-10' />
      {/each}
   </div>
{/await}