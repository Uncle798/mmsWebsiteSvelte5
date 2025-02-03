<script lang='ts'>
	import HorizontalDivider from "./HorizontalDivider.svelte";

   interface Props {
      amount: number
      label: string
   }
   let { amount, label }:Props = $props()
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
</script>
<div class="ml-4">
   {label}: {currencyFormatter.format(amount)}
</div>