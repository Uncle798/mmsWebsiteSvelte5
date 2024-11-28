<script lang="ts">
   import type { Unit } from "@prisma/client";
   interface Props {
      unit: Unit
   }
   let { unit }:Props = $props();
</script>
<div class="card p-4">
   <p>Unit</p>
   <p >Number: {unit.num.replace(/^0+/gm,'')}</p>
   <p >Size: {unit.size.replace(/^0+/gm, '').replace(/x0/gm, 'x')}</p>
   <p >Description: {unit.description}</p>
   <p >Price: ${unit.advertisedPrice}</p>
   <p >Deposit: ${unit.deposit}</p>
</div>