<script lang="ts">
    import Invoice from '$lib/displayComponents/Invoice.svelte';
import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>
{#if data.invoice}
    <Invoice invoice={data.invoice} />
{/if}