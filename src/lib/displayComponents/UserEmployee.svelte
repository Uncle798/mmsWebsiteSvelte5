<script lang="ts">
	import EmailVerificationForm from '$lib/forms/EmailVerificationForm.svelte';
	import type { PartialUser } from '$lib/server/partialTypes';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { Check } from 'lucide-svelte';

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
	<span class=""><a href="mailto:{user.email}" class="anchor">{user.email}</a>
	{#if user.emailVerified}
		<Check aria-label='Email verified' color='green' />
	{/if}
	</span>
</div>
