<script lang="ts">
	import '../app.css';
	import { ToastProvider } from '@skeletonlabs/skeleton-svelte';
	import type { PageData } from './$types';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import Menu from 'lucide-svelte/icons/menu';
	import SquareMenu from 'lucide-svelte/icons/square-menu';
	import { fade, draw } from 'svelte/transition';
	import { enhance } from '$app/forms';
	interface Props {
		children: import('svelte').Snippet
	}
	let { children } = $props();
	interface Link {
		link: string;
		label: string;
	}
	let links:Link[] =[
		{link: '/', label: 'Home'},
		{link: '/forms/addressForm', label: 'Address Form'},
	]
	let menuOpen = $state(false);

</script>

<Modal
	bind:open={menuOpen}
	triggerBase="btn preset-tonal"
	contentBase="bg-surface-100-900 p-2 space-y-2 shadow-xl w-[200px] h-screen"
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
		</ul>
	</article>
{/snippet}
</Modal>
<ToastProvider placement='top-start'>
	{@render children()}
</ToastProvider>
