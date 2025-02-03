<script lang='ts'>
	import HorizontalDivider from "./HorizontalDivider.svelte";

   interface Props {
      amount: number;
      label: string;
      classes?: string;
   }
   let { amount, label, classes}:Props = $props()
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
</script>
<div class="ml-4 {classes}">
   {label}: {currencyFormatter.format(amount)}
</div>