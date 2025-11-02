<script lang="ts">
	import type { User } from '@prisma/client';
	import { Check } from 'lucide-svelte';

	interface Props {
		user: User;
		classes?: string;
	}
	let { user, classes }: Props = $props();
</script>

<div class="{classes} flex flex-col">
	{#if user.doNotRent}
		<span class=" font-extrabold text-error-50-950 bg-error-contrast-50-950 text-center ">DO NOT RENT TO {user.organizationName ? user.organizationName.toUpperCase() : `${user.givenName?.toUpperCase()} ${user.familyName?.toUpperCase()}`}</span>
	{/if}
	{#if user.organizationName}
		<span><a href="/users/{user.id}" class="anchor">{user.organizationName}</a></span>
		<span>{user.givenName} {user.familyName}</span>
	{:else}
		<span><a href="/users/{user.id}" class="anchor">{user.givenName} {user.familyName}</a></span>
	{/if}
	<span class="flex"><a href="mailto:{user.email}" class="anchor truncate">{user.email}</a>
	{#if user.emailVerified}
		<Check aria-label='Email verified' color='green' />
	{/if}
	</span>
	{#if user.customerNotes}
		<span>{user.customerNotes}</span>
	{/if}

</div>
