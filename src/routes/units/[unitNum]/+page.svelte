<script lang="ts">
    import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>
{#if !data.unit}
   ...loading unit
{:else}
   <UnitEmployee unit={data.unit}/>
{/if}