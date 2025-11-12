<script lang="ts">
	import type { Address } from "@prisma/client";
   interface Props {
      address: Address;
      classes?: string;
   }
   let { address, classes }:Props = $props();

</script>

<div class="{classes}">
   {#if address.phoneNum1}
      <a href="tel:{address.phoneNum1}" class="anchor">{address.phoneNum1.substring(0,3) + '.' + address.phoneNum1.substring(3,6) + '.' + address.phoneNum1.substring(6,10)}</a>
   {/if}
   <p>{address.address1}</p>
   {#if address.address2}
      <p>{address.address2}</p>
   {/if}
   {#if address.city && address.state}
      <p>{address.city}, {address.state}, {address.postalCode}</p>
   {/if}
</div>