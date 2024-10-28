<script lang="ts">
	import { Nav } from '@skeletonlabs/skeleton-svelte'

	import '../app.css';
	interface Link {
		link: string;
		label: string;
	}
	let links:Link[] =[
		{link: '/', label: 'Home'},
		{link: '/register', label: 'Register'},
		{link: '/register/emailVerification', label:'Email Verification'}
	]
	let { children } = $props();

	let navValue = $state('0')
</script>

<Nav.Bar bind:value={navValue}>
	{#each links as link, i}
		<Nav.Tile id={i.toString()} label={link.label} href={link.link}>
			{link.label}
		</Nav.Tile>
	{/each}
</Nav.Bar>

{@render children()}
