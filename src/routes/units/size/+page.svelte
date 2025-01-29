<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>
{#await data.sizes}
   loading units
{:then sizes} 
   Please select size:
   {#each sizes as size}
      <a href="/units/size/{size}" class="btn">{size.replace(/^0+/gm, '').replace(/x0/gm,'x')}</a>
   {/each}
{/await}