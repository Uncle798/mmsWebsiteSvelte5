<script lang="ts">
	import { Nav } from '@skeletonlabs/skeleton-svelte'

	import '../app.css';
	import type { PageData } from './$types';
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

	let navValue = $state('')
</script>

<Nav.Bar bind:value={navValue}>
	{#each links as link, i}
		<Nav.Tile id={i.toString()} label={link.label} href={link.link}>
			{link.label}
		</Nav.Tile>
		{/each}
		{#if data.user}
			<form action="/logout">
				<Nav.Tile id={links.length.toString()} label='Logout' >
					Logout
				</Nav.Tile>
			</form>
			{:else}
				<Nav.Tile id={links.length.toString()} label='Login' href='/login' >
					Login
				</Nav.Tile>
		{/if}
</Nav.Bar>

{@render children()}
