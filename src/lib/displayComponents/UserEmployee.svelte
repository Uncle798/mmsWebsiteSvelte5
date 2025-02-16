<script lang="ts">
	import type { PartialUser } from '$lib/server/partialTypes';

	interface Props {
		user: PartialUser;
		classes?: string;
	}
	let { user, classes }: Props = $props();
</script>

<div class="{classes}">
	<p><a href="/users/{user.id}" class="anchor">{user.givenName} {user.familyName}</a></p>
	{#if user.organizationName}
		<p>{user.organizationName}</p>
	{/if}
	<p class="truncate"><a href="mailto:{user.email}" class="anchor">{user.email}</a></p>
</div>
