<script lang="ts">
	import type { PartialUser } from "$lib/server/partialTypes";

   interface Props {
      user: PartialUser
      widthClass: string;
   }
   let { user, widthClass }:Props = $props()
</script>

<div class="p-4 {widthClass} flex-none">
   <p ><a href="/users/{user.id}">{user.givenName} {user.familyName}</a></p>
   {#if user.organizationName}
      <p><a href="/users/{user.id}">{user.organizationName}</a></p>
   {/if}
   <p>{user.email}</p>
   <p>Stripe Id: {user.stripeId}</p>
</div>