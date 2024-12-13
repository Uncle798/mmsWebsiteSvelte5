<script lang="ts">
    import Invoice from '$lib/displayComponents/Invoice.svelte';
	import { fade } from 'svelte/transition';
    import type { PageData } from './$types';
	import User from '$lib/displayComponents/User.svelte';

    let { data }: { data: PageData } = $props();
</script>

{#each data.unpaidInvoices as invoice}
{@const {customer} = invoice}
    <div class="flex" transition:fade={{duration:600}}>
        <Invoice invoice={invoice} />
        {#if customer}
            <User user={customer} />
        {/if}
    </div>
{/each}