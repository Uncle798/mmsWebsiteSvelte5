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
      <p >{user.organizationName}</p>
   {/if}
   <p>{user.email}</p>
</div>