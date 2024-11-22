<script lang="ts">
    import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
    import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import User from '$lib/displayComponents/User.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
    let { units, leases, customers} = data;
</script>
{#if !units}
    ...loading units
    {:else}
    {#each units as unit}
        <UnitEmployee unit={unit} />
        {@const lease = leases?.find((lease)=>{lease.unitNum === unit.num})}
        {#if lease}
        <LeaseEmployee lease={lease} />
        {/if}
    {/each}
{/if}