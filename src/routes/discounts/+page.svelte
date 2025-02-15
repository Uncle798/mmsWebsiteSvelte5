<script lang="ts">
    import Discount from '$lib/displayComponents/Discount.svelte';
	import DiscountEndForm from '$lib/forms/DiscountEndForm.svelte';
	import NewDiscountForm from '$lib/forms/NewDiscountForm.svelte';
	import Header from '$lib/Header.svelte';
	import { fade } from 'svelte/transition';
    import type { PageData } from './$types';
	import HorizontalDivider from '$lib/displayComponents/HorizontalDivider.svelte';

    let { data }: { data: PageData } = $props();

</script>
<Header title="Discounts" />
<div transition:fade={{duration:600}} class="mx-2">
    <h3 class="h3">Current Discounts</h3>
{#each data.discounts as discount}
    <Discount {discount} classes='border border-primary-50 dark:border-primary-950 w-64 rounded-lg'/>
    <DiscountEndForm data={data.discountEndForm} discountId={discount.discountId}/>
{/each}
    <HorizontalDivider />
    <NewDiscountForm data={data.newDiscountForm} />
</div>