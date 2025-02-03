<script lang="ts">
   import type { Unit, Lease } from '@prisma/client';
   interface Props {
      unit: Unit,
      classes?: string;
   }
   let { unit, classes }:Props = $props();
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
</script>

<div class="p-4 {classes} flex-none">
   <p>Unit Number: <a href="/units/{unit.num}">{unit.num.replace(/^0+/gm,'')}</a></p>
   <p>Size: <a href="/units/size/{unit.size}">{unit.size.replace(/^0+/gm, '').replace(/x0/gm, 'x')}</a></p>
   <p>Advertised Price: {currencyFormatter.format(unit.advertisedPrice)}</p>
   {#if unit.leasedPrice}
   <p>Leased Price: {currencyFormatter.format(unit.leasedPrice)}</p>
   {/if}
   {#if unit.notes}
      <p>Notes: {unit.notes}</p>
   {/if}
</div>