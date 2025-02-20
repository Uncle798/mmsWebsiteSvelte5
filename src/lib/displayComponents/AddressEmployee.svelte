<script lang="ts">
	import type { Address } from "@prisma/client";
   interface Props {
      address: Address;
      classes?: string;
   }
   let { address = $bindable(), classes }:Props = $props()
   const formattedPhone = address.phoneNum1.substring(0,3) + '.' + address.phoneNum1.substring(3,6) + '.' + address.phoneNum1.substring(6,10);
</script>

<div class="{classes}">
   <p>{address.address1}</p>
   {#if address.address2}
      <p>{address.address2}</p>
   {/if}
   <p>{address.city}, {address.state}, {address.postalCode}</p>
   <div><a href="tel:{address.phoneNum1}" class="anchor">{formattedPhone}</a></div>
</div>