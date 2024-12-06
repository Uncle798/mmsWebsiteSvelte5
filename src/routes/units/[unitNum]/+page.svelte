<script lang="ts">
    import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import Header from '$lib/Header.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<Header title='Unit number: {data.unit.num}' />
{#if !data.unit}
   ...loading unit
{:else}
   <UnitEmployee unit={data.unit}/>
{/if}