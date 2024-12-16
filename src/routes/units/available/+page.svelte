<script lang="ts">
    import Header from '$lib/Header.svelte';
	import { fade } from 'svelte/transition';
import type { PageData } from './$types';
    
    let { data }:{data:PageData} = $props();
</script>
<Header title='Available Units' />
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
                    <td><a class="btn" href="/employeeNewLease?unitNum={unit.num}">{unit.num.replace(/^0+/gm,'')}</a></td>
                    <td><a class="btn" href="/employeeNewLease?unitNum={unit.num}">{unit.size.replace(/^0+/gm,'').replace(/x0/gm, 'x')}</a></td>
                    <td><a class="btn" href="/employeeNewLease?unitNum={unit.num}">{unit.description}</a></td>
                    <td><a class="btn" href="/employeeNewLease?unitNum={unit.num}">${unit.advertisedPrice}</a></td>
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