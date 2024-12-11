<script lang="ts">
    import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import User from '$lib/displayComponents/User.svelte';
	import { leaseDiscountFormSchema } from '$lib/formSchemas/schemas';
	import Header from '$lib/Header.svelte';
	import { fade } from 'svelte/transition';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

{#if !data.unit}
<Header title='loading...' />
...loading unit
{:else}
<div transition:fade={{duration:600}}>

</div>
    {@const { lease } = data.unit}
   <Header title='Unit number: {data.unit.num}' />
   <UnitEmployee unit={data.unit}/>
   {#each lease as l}
    {@const {customer} = l}
        <div class="flex">
            <LeaseEmployee lease={l} />
            <User user={customer} />
        </div>
   {/each}
{/if}