<script lang='ts'>
   
   interface Props {
      amount: number;
      label: string;
      classes?: string;
   }
   let { amount, label, classes}:Props = $props()
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
</script>
<div class="flex gap-1 {classes}">
   <div class="mx-2">{label}:</div><div class="font-medium">{currencyFormatter.format(amount)}</div>
</div>