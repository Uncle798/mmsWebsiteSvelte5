<script lang="ts">
    import { page } from '$app/stores';
	import Header from '$lib/Header.svelte';
</script>
<Header title={$page.error?.message ? $page.error.message : ''} />
<div class="mt-10">
    <h1>{$page.status}: {$page.error?.message}</h1>
</div>