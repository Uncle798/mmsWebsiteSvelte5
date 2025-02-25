<script lang="ts">
	import { goto } from '$app/navigation';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
    let currentYear = $state('');
    function onSelect(event:Event){
        const select = event.target as HTMLSelectElement;
        const year = select.value;
        goto(`/paymentRecords/year/${year}`);
    }
</script>
<div class="mt-10">
    <label for="selectYear" class="label-text"> 
        Select year:
        <select name="selectYear" id="selectYear" class="select" bind:value={currentYear} onchange={onSelect}>
            {#each data.years as year}
            <option value={year}>{year}</option>
            {/each}
        </select> 
    </label>
</div>