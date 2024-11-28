<script lang="ts">
    import Discount from '$lib/displayComponents/Discount.svelte';
	import DiscountEndForm from '$lib/forms/DiscountEndForm.svelte';
	import NewDiscountForm from '$lib/forms/NewDiscountForm.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

</script>

{#each data.discounts as discount}
    <Discount discount={discount} />
    <DiscountEndForm data={data.discountEndForm} discountId={discount.discountId}/>
{/each}

<NewDiscountForm data={data.newDiscountForm} />