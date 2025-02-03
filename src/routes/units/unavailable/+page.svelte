<script lang="ts">
   import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
   import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();
</script>

{#each data.units as unit}
   <UnitEmployee unit={unit} />
{/each}