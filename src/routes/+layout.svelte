<script lang="ts">
	import '../app.css';
	import { ToastProvider } from '@skeletonlabs/skeleton-svelte';
	import type { PageData } from './$types';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import Menu from 'lucide-svelte/icons/menu';
	import { goto } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms';
	interface Props {
		data: PageData,
		children: import('svelte').Snippet
	}
	let { data, children }:Props = $props();
	interface Link {
		link: string;
		label: string;
	}
	let customerLinks:Link[] =[
		{link: '/', label: 'Home'},
		{link: '/units/available', label:'Available Units'},
		{link: '/newLease', label: 'New lease'},
	]
	let employeeLinks:Link[] = [
		{link: '/units', label:'Units'},
		{link: '/units/available', label:'Available Units'},
		{link: '/units/unavailable', label: 'Unavailable units'},
		{link: '/units/recentlyMovedOut', label: 'Recently moved out Units'},
		{link: '/units/size', label: 'Units by size'},
		{link: '/discounts', label: 'Discounts'},
		{link: '/users/customers', label: 'Customers'},
		{link: '/invoices', label: 'Invoices'},
		{link: '/invoices/unpaid', label: 'Unpaid invoices'},
		{link: '/invoices/year', label: 'Invoices by year'},
		{link: '/invoices/new', label: 'New Invoice'},
		{link: '/paymentRecords', label: 'Payment Records'},
		{link: '/paymentRecords/deposits', label: 'Deposits'},
		{link: '/paymentRecords/incomplete', label:'Incomplete Payment Records'},
		{link: '/paymentRecords/year', label: 'Payment Records by year'},
		{link: '/paymentRecords/new', label:'New Payment Record'},
		{link: '/refundRecords', label:'Refund Records'},
		{link: '/refundRecords/new', label:'New Refund'},
		{link: '/refundRecords/year', label: 'Refunds by year'},
		{link: '/employeeNewLease', label:'New lease'},
		{link: '/employeeNewCustomer', label:'New customer'},
	]
	let adminLinks:Link[] = [
		{link: '/users', label:'All Users'},

	]
	let menuOpen = $state(false);
	const { submit, enhance } = superForm(data.logOutForm)
	function onButtonClick(link:string){
		goto(link)
		menuOpen=false
		if(link === '/logout'){
			submit()
		}
	}
</script>

<Modal
	bind:open={menuOpen}
	triggerBase="btn preset-tonal hover:shadow-xl hover:border-2 border-primary-50 dark:border-primary-950"
	contentBase="bg-surface-100-900 p-2 space-y-2 shadow-xl w-[280px] h-screen"
	positionerJustify="justify-start"
	positionerAlign=""
	positionerPadding=""
	transitionsPositionerIn={{ x: -280, duration: 400 }}
	transitionsPositionerOut={{ x: -280, duration: 400 }}
>
{#snippet trigger()}
		<Menu class='mx-2 border-2' />	
{/snippet}
{#snippet content()}
	<article>
		<ul>
			{#if !data.user?.employee}
				{#each customerLinks as link}
					<li><button class="anchor" type="button" onclick={()=>onButtonClick(link.link)}>{link.label}</button></li>
				{/each}		
			{/if}
			{#if data.user?.employee}
				{#each employeeLinks as employeeLink}
					<li><button class="anchor" type="button" onclick={()=>onButtonClick(employeeLink.link)}>{employeeLink.label}</button></li>
				{/each}
			{/if}
			{#if data.user?.admin}
				{#each adminLinks as adminLink}
					<li><button class="anchor" type="button" onclick={()=>onButtonClick(adminLink.link)}>{adminLink.label}</button></li>
				{/each}
			{/if}
			<div class="absolute bottom-0 p-2 mb-4">
				{#if data.user}
					<form action="/logout" method="post" use:enhance>
						<li><button class="anchor" type="button" onclick={()=>onButtonClick("/logout")}>Logout</button></li>
					</form>
				{:else}
					<li><button class="anchor" type="button" onclick={()=>onButtonClick("/login")}>Login</button></li>
				{/if}
			</div>
		</ul>
	</article>
{/snippet}
</Modal>
<ToastProvider placement='top-start'>
	{@render children()}
</ToastProvider>

