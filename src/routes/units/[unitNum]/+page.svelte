<script lang="ts">
    import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import Header from '$lib/Header.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

{#if !data.unit}
<Header title='loading...' />
...loading unit
{:else}
   <Header title='Unit number: {data.unit.num}' />
   <UnitEmployee unit={data.unit}/>
{/if}