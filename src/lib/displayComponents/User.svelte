<script lang="ts">
	import type { PartialUser } from "$lib/server/partialTypes";

   interface Props {
      user: PartialUser;
      widthClass: string;
   }
   let { user, widthClass }:Props = $props()
</script>

<div class="m-4 {widthClass} flex-none">
   <p ><a href="/users/{user.id}">{user.givenName} {user.familyName}</a></p>
   {#if user.organizationName}
      <p >{user.organizationName}</p>
   {/if}
   <p>{user.email}</p>
</div>