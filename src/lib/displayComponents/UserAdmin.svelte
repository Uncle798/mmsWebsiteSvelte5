<script lang="ts">
	import type { PartialUser } from '$lib/server/partialTypes';

	interface Props {
		user: PartialUser;
		classes?: string;
	}
	let { user, classes }: Props = $props();
</script>

<div class="{classes}">
	<div><a href="/users/{user.id}" class="anchor">{user.givenName} {user.familyName}</a></div>
	{#if user.organizationName}
		<div>{user.organizationName}</div>
	{/if}
	<div class="truncate"><a href="mailto:{user.email}" class="anchor">{user.email}</a></div>
	<div class="grid grid-cols-2 gap-x-2">
		{#if user.admin}
			<div class="col-span-2 font-medium text-center">Admin</div>
			{:else if user.employee}	
			<div class="col-span-2 font-medium text-center">Employee</div>
		{/if}
	</div>
</div>
