<script lang="ts">
    import Invoice from '$lib/displayComponents/Invoice.svelte';
import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

{#each data.unpaidInvoices as invoice}
    <div>
        <Invoice invoice={invoice} />
    </div>
{/each}