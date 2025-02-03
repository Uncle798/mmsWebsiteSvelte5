<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>
Select year: 
{#each data.years as year}
    <a href="/invoices/year/{year}" class="btn">{year},</a>
{/each}