<script lang="ts">
	import type { PartialUser } from "$lib/server/partialTypes";

   interface Props {
      user: PartialUser
   }
   let { user }:Props = $props()
</script>

<div class="card p-4">
   <span class="h2"><a href="/users/{user.id}">{user.givenName} {user.familyName}</a></span>
   {#if user.organizationName}
      <span class="h3">{user.organizationName}</span>
   {/if}
   <span class="h3">{user.email}</span>
</div>