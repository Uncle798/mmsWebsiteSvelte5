<script lang="ts">
	import type { User } from '@prisma/client';

	interface Props {
		user: User;
		classes?: string;
	}
	let { user, classes }: Props = $props();
</script>

<div class="{classes}">
	<p>{user.givenName} {user.familyName}</p>
	{#if user.organizationName}
		<p>{user.organizationName}</p>
	{/if}
	<p class="truncate">{user.email}</p>
</div>
