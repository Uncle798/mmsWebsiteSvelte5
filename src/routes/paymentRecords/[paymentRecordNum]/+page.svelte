<script lang="ts">
   import PaymentRecord from '$lib/displayComponents/PaymentRecord.svelte';
	import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();
</script>

{#if data.paymentRecord }
   <Header title='Payment Record Num: {data.paymentRecord}' />
   <PaymentRecord paymentRecord={data.paymentRecord} />
{/if}