<script lang="ts">
   import type { Unit, Lease } from '@prisma/client';
   interface Props {
      unit: Unit,
   }
   let { unit }:Props = $props();
</script>

<div class="card p-4">
   <p>Unit Number: <a href="/units/{unit.num}">{unit.num.replace(/^0+/gm,'')}</a></p>
   <p>Size: <a href="/units/size/{unit.size}">{unit.size.replace(/^0+/gm, '').replace(/x0/gm, 'x')}</a></p>
   <p>Advertised Price: ${unit.advertisedPrice}</p>
   {#if unit.leasedPrice}
   <p>Leased Price: ${unit.leasedPrice}</p>
   {/if}
   {#if unit.notes}
      <p>Notes: {unit.notes}</p>
   {/if}
</div>