<script lang="ts">
	import type { PartialUser } from "$lib/server/partialTypes";

   interface Props {
      user: PartialUser
   }
   let { user }:Props = $props()
</script>

<div class="m-4 w-1/3 flex-none">
   <p ><a href="/users/{user.id}">{user.givenName} {user.familyName}</a></p>
   {#if user.organizationName}
      <p >{user.organizationName}</p>
   {/if}
   <p>{user.email}</p>
</div>