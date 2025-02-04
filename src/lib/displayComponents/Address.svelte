<script lang="ts">
	import type { Address } from "@prisma/client";
   interface Props {
      address: Address;
      classes?: string;
   }
   let { address = $bindable(), classes }:Props = $props()
</script>

<div class="{classes}">
   <p>{address.address1}</p>
   {#if address.address2}
      <p>{address.address2}</p>
   {/if}
   <p>{address.city}, {address.state}, {address.postalCode}</p>
   <div><a href="tel:{address.phoneNum1}">{address.phoneNum1}</a></div>
</div>