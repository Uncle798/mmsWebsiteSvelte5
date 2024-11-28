<script lang="ts">
	import '../app.css';
	import { ToastProvider } from '@skeletonlabs/skeleton-svelte';
	import type { PageData } from './$types';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import Menu from 'lucide-svelte/icons/menu';
	import { enhance } from '$app/forms';
	interface Props {
		data: PageData,
		children: import('svelte').Snippet
	}
	let { data, children } = $props();
	interface Link {
		link: string;
		label: string;
	}
	let links:Link[] =[
		{link: '/', label: 'Home'},
		{link: '/register', label: 'Register'},
		{link: '/units/available', label:'Available Units'},
		{link: '/newLease', label: 'New lease'},
		{link: '/units', label:'Units'},
		{link: '/users', label:'Users'},
		{link: '/users/customers', label: 'Customers'},
		{link: '/discounts', label: 'Discounts'}
	]
	let menuOpen = $state(false);

</script>

<Modal
	bind:open={menuOpen}
	triggerBase="btn preset-tonal"
	contentBase="bg-surface-100-900 p-2 space-y-2 shadow-xl w-[275px] h-screen"
	positionerJustify="justify-start"
	positionerAlign=""
	positionerPadding=""
	transitionsPositionerIn={{ x: -480, duration: 200 }}
	transitionsPositionerOut={{ x: -480, duration: 200 }}
>
{#snippet trigger()}
	<Menu />	
{/snippet}
{#snippet content()}
	<article>
		<ul>
			{#each links as link}
				<li><a class="btn" href={link.link}>{link.label}</a></li>
			{/each}
			{#if data.user}
				<form action="/logout" method="post" use:enhance>
					<li><button class="btn">Logout</button></li>
				</form>
				<li><a class="btn" href="/accountSettings">Settings</a></li>
				{:else}
				<li><a class="btn" href="/login">Login</a></li>
			{/if}
		</ul>
	</article>
{/snippet}
</Modal>
<ToastProvider placement='top-start'>
	{@render children()}
</ToastProvider>
