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
	let customerLinks:Link[] =[
		{link: '/', label: 'Home'},
		{link: '/units/available', label:'Available Units'},
		{link: '/newLease', label: 'New lease'},
	]
	let employeeLinks:Link[] = [
		{link: '/units', label:'Units'},
		{link: '/units/unavailable', label: 'Unavailable units'},
		{link: '/units/recentlyMovedOut', label: 'Recently moved out Units'},
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
		{link: '/employeeNewLease', label:'Employee new lease'},
		{link: '/employeeNewCustomer', label:'Employee new customer'},
	]
	let adminLinks:Link[] = [
		{link: '/users', label:'All Users'},

	]
	let menuOpen = $state(false);

</script>

<Modal
	bind:open={menuOpen}
	triggerBase="btn preset-tonal"
	contentBase="bg-surface-100-900 p-2 space-y-2 shadow-xl w-[325px] h-screen"
	positionerJustify="justify-start"
	positionerAlign=""
	positionerPadding=""
	transitionsPositionerIn={{ x: -480, duration: 200 }}
	transitionsPositionerOut={{ x: -480, duration: 200 }}
	onclick={()=>{
		menuOpen=false;
	}} 
>
{#snippet trigger()}
		<Menu class='mx-2' />	
{/snippet}
{#snippet content()}
	<article>
		<ul>
			{#each customerLinks as link}
				<li><a class="btn" href={link.link}>{link.label}</a></li>
			{/each}
			{#if data.user?.employee}
				{#each employeeLinks as employeeLink}
					<li><a class="btn" href={employeeLink.link}>{employeeLink.label}</a></li>
				{/each}
			{/if}
			{#if data.user?.admin}
				{#each adminLinks as adminLink}
					<li><a href={adminLink.link} class="btn">{adminLink.label}</a></li>
				{/each}
			{/if}
			<div class="card absolute bottom-0 p-4 mb-4">
				{#if data.user}
				<form action="/logout" method="post" use:enhance>
					<li><button class="btn">Logout</button></li>
				</form>
				<li><a class="btn" href="/accountSettings">Settings</a></li>
				{:else}
				<li><a class="btn" href="/login">Login</a></li>
				{/if}
			</div>
		</ul>
	</article>
{/snippet}
</Modal>
<ToastProvider placement='top-start'>
	{@render children()}
</ToastProvider>
