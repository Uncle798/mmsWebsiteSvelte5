<script lang="ts">
	import type { ContactInfo } from "@prisma/client";
   interface Props {
      address: ContactInfo;
   }
   let { address = $bindable() }:Props = $props()
</script>

<div class="card p-4">
   <p>{address.address1}</p>
   {#if address.address2}
      <p>{address.address2}</p>
   {/if}
   <p>{address.city}, {address.state}, {address.zip}</p>
</div>