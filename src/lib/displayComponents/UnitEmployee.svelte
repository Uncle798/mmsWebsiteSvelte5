<script lang="ts">
   import type { Unit, Lease } from '@prisma/client';
   interface Props {
      unit: Unit,
   }
   let { unit }:Props = $props();
</script>

<div class="card p-4">
   <p >Unit Number: {unit.num.replace(/^0+/gm,'')}</p>
   <p>Size: {unit.size.replace(/^0+/gm, '').replace(/x0/gm, 'x')}</p>
   <p>Advertised Price: ${unit.advertisedPrice}</p>
   {#if unit.leasedPrice}
   <p>Leased Price: ${unit.leasedPrice}</p>
   {/if}
   {#if unit.notes}
      <p>Notes: {unit.notes}</p>
   {/if}
</div>