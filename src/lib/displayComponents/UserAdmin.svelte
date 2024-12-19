<script lang="ts">
	import type { PartialUser } from "$lib/server/partialTypes";

   interface Props {
      user: PartialUser
   }
   let { user }:Props = $props()
</script>

<div class="card p-4">
   <p ><a href="/users/{user.id}">{user.givenName} {user.familyName}</a></p>
   {#if user.organizationName}
      <p><a href="/users/{user.id}">{user.organizationName}</a></p>
   {/if}
   <p>{user.email}</p>
   <p>Stripe Id: {user.stripeId}</p>
</div>