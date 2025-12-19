<script lang="ts">
	import Expense from '$lib/displayComponents/Expense.svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>
<div class="mt-14 sm:mt-12 mb-8 mx-2">
    {#if data.expense}
        <Expense expense={data.expense} vendor={data.expense.vendor} employee={data.expense.employee} />
    {/if}
</div>