<script lang='ts'>
   import { currencyFormatter } from "$lib/utils/currencyFormatter";
   
   interface Props {
      amount: number;
      label: string;
      classes?: string;
   }
   let { amount, label, classes}:Props = $props()
</script>
<div class="flex {classes}">
   <div class="">{label}:</div><div class="font-medium mx-2">{currencyFormatter(amount)}</div>
</div>