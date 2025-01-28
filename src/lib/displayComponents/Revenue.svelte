<script lang='ts'>
   interface Props {
      amount: number
      label: string
   }
   let { amount, label }:Props = $props()
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
</script>

<div>
   {label}: {currencyFormatter.format(amount)}
</div>