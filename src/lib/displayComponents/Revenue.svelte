<script lang='ts'>
   
   interface Props {
      amount: number;
      label: string;
      classes?: string;
   }
   let { amount, label, classes}:Props = $props()
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
</script>
<div class="flex {classes}">
   <div class="label-text">{label}:</div><div class="font-medium mx-2 sm:mx-0">{currencyFormatter.format(amount)}</div>
</div>