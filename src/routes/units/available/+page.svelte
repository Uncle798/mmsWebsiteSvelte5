<script lang="ts">
    import Header from '$lib/Header.svelte';
	import { fade } from 'svelte/transition';
    import type { PageData } from './$types';
	import HorizontalDivider from '$lib/displayComponents/HorizontalDivider.svelte';
    let { data }:{data:PageData} = $props();
    const currencyFormatter = new Intl.NumberFormat('en-US', {style: 'currency', currency:'USD'})
</script>
<Header title='Available Units' />
{#if data.lostRevenue}
    <div class="flex">
        <span class="m-2">Available: {data.availableUnits.length} of {data.totalUnits}</span>
        <span class="m-2">Available percentage {Math.round(data.percentAvailable)}%</span>
        <span class="m-2">Open revenue per month: {currencyFormatter.format(data.lostRevenue)}</span>
    </div>
    <HorizontalDivider />
{/if}
<div class="table-wrap" transition:fade={{duration:600}}>
    <table class="table">
        <caption>Available units.</caption>
        <thead>
            <tr>
                <th>Unit Number</th>
                <th>Size (WxL in feet)</th>
                <th>Approximate amount of stuff</th>
                <th>Price per month</th>
            </tr>        
        </thead>
        <tbody class="hover:[&>tr]:preset-tonal-primary">
            {#each data.availableUnits as unit}
                <tr>
                    {#if data.user?.employee}
                    <td><a class="btn" href="/employeeNewLease?unitNum={unit.num}&userId={data.userId}">{unit.num.replace(/^0+/gm,'')}</a></td>
                    <td><a class="btn" href="/employeeNewLease?unitNum={unit.num}&userId={data.userId}">{unit.size.replace(/^0+/gm,'').replace(/x0/gm, 'x')}</a></td>
                    <td><a class="btn" href="/employeeNewLease?unitNum={unit.num}&userId={data.userId}">{unit.description}</a></td>
                    <td><a class="btn" href="/employeeNewLease?unitNum={unit.num}&userId={data.userId}">${unit.advertisedPrice}</a></td>
                    {:else}
                    <td><a class="btn" href="/newLease?unitNum={unit.num}">{unit.num.replace(/^0+/gm,'')}</a></td>
                    <td><a class="btn" href="/newLease?unitNum={unit.num}">{unit.size.replace(/^0+/gm,'').replace(/x0/gm, 'x')}</a></td>
                    <td><a class="btn" href="/newLease?unitNum={unit.num}">{unit.description}</a></td>
                    <td><a class="btn" href="/newLease?unitNum={unit.num}">${unit.advertisedPrice}</a></td>
                    {/if}
                </tr>
            {/each}
        </tbody>
    </table>
</div>