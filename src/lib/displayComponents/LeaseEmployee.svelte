<script lang='ts'>
   import type { Lease } from "@prisma/client";
   import type { PartialUser } from "$lib/server/partialTypes";
	import dayjs from "dayjs";
   interface Props {
      lease: Lease;
      customer: PartialUser
   }
   let { lease, customer }:Props = $props()
</script>

<div class="card p-4">
   <span>Customer name: <a href="/users/{customer.id}">{customer.givenName} {customer.familyName}<br/>
      {#if customer.organizationName}
         {customer.organizationName}
      {/if}   
   </a></span>
   <span>Lease effective date {dayjs(lease.leaseEffectiveDate).format('M/D/YYYY')}</span>
   <span>Lease price ${lease.price}</span>
</div>