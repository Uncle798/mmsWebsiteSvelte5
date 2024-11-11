<script lang="ts">
   import type { Unit } from "@prisma/client";
   interface Props {
      unit: Unit
   }
   let { unit }:Props = $props();
</script>
<div class="card p-4">
   <span class="h3">Unit</span>
   <span class="h4">Number {unit.num.replace(/^0+/gm,'')}</span>
   <span class="h5">Size {unit.size.replace(/^0+/gm, '').replace(/x0/gm, 'x')}</span>
   <span class="h5">Price ${unit.advertisedPrice}</span>
</div>