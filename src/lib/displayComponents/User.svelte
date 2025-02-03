<script lang="ts">
	import type { PartialUser } from "$lib/server/partialTypes";

   interface Props {
      user: PartialUser;
      classes?: string;
   }
   let { user, classes }:Props = $props()
</script>

<div class="m-4 flex-none {classes}">
   <p ><a href="/users/{user.id}">{user.givenName} {user.familyName}</a></p>
   {#if user.organizationName}
      <p >{user.organizationName}</p>
   {/if}
   <p>{user.email}</p>
</div>