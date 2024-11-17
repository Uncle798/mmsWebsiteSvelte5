<script lang="ts">
    import Header from '$lib/Header.svelte';
import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>
<Header title='Lease Sent' />
<pre>{data.packetDetails}</pre>