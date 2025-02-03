<script lang="ts">
	import type { Address } from "@prisma/client";
   interface Props {
      address: Address;
   }
   let { address = $bindable() }:Props = $props()
</script>

<div class="m-4">
   <p>{address.address1}</p>
   {#if address.address2}
      <p>{address.address2}</p>
   {/if}
   <p>{address.city}, {address.state}, {address.postalCode}</p>
</div>