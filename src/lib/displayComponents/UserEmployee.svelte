<script lang="ts">
	import type { PartialUser } from '$lib/server/partialTypes';

	interface Props {
		user: PartialUser;
		classes?: string;
	}
	let { user, classes }: Props = $props();
</script>

<div class="{classes} flex flex-col">
	<span><a href="/users/{user.id}" class="anchor">{user.givenName} {user.familyName}</a></span>
	{#if user.organizationName}
		<span>{user.organizationName}</span>
	{/if}
	<span class=""><a href="mailto:{user.email}" class="anchor truncate">{user.email}</a></span>
</div>
