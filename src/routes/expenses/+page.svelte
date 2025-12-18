<script lang="ts">
    import type { PageProps } from './$types';
    import Expense from '$lib/displayComponents/Expense.svelte';
    let { data }: PageProps = $props();
</script>

<div>
    {#each data.expenses as expense}
    {@const employee = data.employees.find((emp) => emp.id === expense.employeeId)}
    {@const vendor = data.vendors.find((ven) => ven.id === expense.vendorId)}
        {#if employee && vendor}
            <Expense {expense} {employee} {vendor} />
        {/if}
    {/each}
</div>