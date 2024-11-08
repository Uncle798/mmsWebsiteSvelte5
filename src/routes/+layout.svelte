<script lang="ts">
	import { Nav } from '@skeletonlabs/skeleton-svelte'

	import '../app.css';
	import type { PageData } from './$types';
	import Menu from 'lucide-svelte/icons/menu'
	import SquareMenu from 'lucide-svelte/icons/square-menu'
	import { fade, draw } from 'svelte/transition';
	import { enhance } from '$app/forms';
	interface Link {
		link: string;
		label: string;
	}
	let links:Link[] =[
		{link: '/', label: 'Home'},
		{link: '/register', label: 'Register'},
		{link: '/register/emailVerification', label:'Email Verification'},
	]
	interface Props {
		data: PageData,
		children: import('svelte').Snippet
	}
	let { data, children } = $props();
	let menuOpen = $state(false);

</script>

{#if !menuOpen}
	<button class="btn" onclick={()=> menuOpen = true} ><Menu /></button>
	{:else}
	<button class="btn" onclick={()=> menuOpen = false} ><SquareMenu /></button>
	<ul>
		{#each links as link}
			<li class="li"><a class="btn" href={link.link}>{link.label}</a></li>
		{/each}
		{#if !data.user}
			<li><a href="/login" class="btn">Login</a></li>
			{:else}
			<form method="POST" action="/logout">
				<button class="btn">Logout</button>
			</form>
		{/if}
	</ul>
{/if}

{@render children()}
