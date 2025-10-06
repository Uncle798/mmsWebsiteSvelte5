<script lang="ts">
	import type { Address } from "@prisma/client";
	import { onMount } from "svelte";
   interface Props {
      address: Address;
      classes?: string;
   }
   let { address, classes }:Props = $props();

</script>

<div class="{classes}">
   <a href="tel:{address.phoneNum1}" class="anchor">{address.phoneNum1.substring(0,3) + '.' + address.phoneNum1.substring(3,6) + '.' + address.phoneNum1.substring(6,10)}</a>
   <p>{address.address1}</p>
   {#if address.address2}
      <p>{address.address2}</p>
   {/if}
   <p>{address.city}, {address.state}, {address.postalCode}</p>
</div>