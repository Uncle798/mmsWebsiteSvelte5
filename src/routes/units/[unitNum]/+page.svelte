<script lang="ts">
    import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
    import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import User from '$lib/displayComponents/User.svelte';
	import Header from '$lib/Header.svelte';
	import { fade } from 'svelte/transition';
    import type { PageData } from './$types';
	import UnitNotesForm from '$lib/forms/UnitNotesForm.svelte';
	import UnitPricingForm from '$lib/forms/UnitPricingForm.svelte';
	import LeaseEndForm from '$lib/forms/LeaseEndForm.svelte';

    let { data }: { data: PageData } = $props();
</script>

{#if !data.unit}
<Header title='loading...' />
...loading unit
{:else}
    {@const { lease } = data.unit}
    <Header title='Unit number: {data.unit.num}' />
    <div transition:fade={{duration:600}}>
        <UnitEmployee unit={data.unit}/>
        <UnitNotesForm data={data.unitNotesForm} unit={data.unit} />
        <UnitPricingForm data={data.unitPricingForm} size={data.unit.size} oldPrice={data.unit.advertisedPrice} />
        {#each lease as l}
            {@const {customer} = l}
                <div class="flex">
                    {#if !l.leaseEnded}                        
                        <LeaseEmployee lease={l} />
                        <LeaseEndForm data={data.leaseEndForm} leaseId={l.leaseId} />
                        <User user={customer} />
                    {/if}
                    <LeaseEmployee lease={l} />
                    <User user={customer} />
                </div>
        {/each}
    </div>
{/if}