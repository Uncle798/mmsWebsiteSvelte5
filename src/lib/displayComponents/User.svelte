<script lang="ts">
	import type { PartialUser } from '$lib/server/partialTypes';

	interface Props {
		user: PartialUser;
		classes?: string;
	}
	let { user, classes }: Props = $props();
</script>

<div class="flex-none p-2 {classes}">
	<p><a href="/users/{user.id}">{user.givenName} {user.familyName}</a></p>
	{#if user.organizationName}
		<p>{user.organizationName}</p>
	{/if}
	<p class="truncate">{user.email}</p>
</div>
