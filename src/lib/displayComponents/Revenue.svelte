<script lang='ts'>
   
   interface Props {
      amount: number;
      label: string;
      classes?: string;
   }
   let { amount, label, classes}:Props = $props()
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
</script>
<div class="ml-4 flex gap-2 {classes}">
   <div class="">{label}:</div><div class="font-medium">{currencyFormatter.format(amount)}</div>
</div>