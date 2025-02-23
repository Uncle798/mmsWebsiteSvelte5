<script lang="ts">
	import '../app.css';
	import { ToastProvider } from '@skeletonlabs/skeleton-svelte';
	import type { PageData } from './$types';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import Menu from 'lucide-svelte/icons/menu';
	import { beforeNavigate } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { PUBLIC_COMPANY_NAME } from '$env/static/public';
	import { XCircleIcon } from 'lucide-svelte';

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

	beforeNavigate(() =>{
		menuOpen = false;
	})
</script>

<Modal
	bind:open={menuOpen}
	triggerBase="btn bg-primary-50 dark:bg-primary-950 hover:shadow-xl hover:border-2 border-secondary-50 dark:border-secondary-950 fixed top-0 z-50"
	contentBase="bg-surface-100-900 p-2 space-y-2 shadow-xl w-[240px] h-screen"
	positionerJustify="justify-start"
	positionerAlign=""
	positionerPadding=""
	transitionsPositionerIn={{ x: -280, duration: 400 }}
	transitionsPositionerOut={{ x: -280, duration: 400 }}
>
{#snippet trigger()}
		<Menu class='mx-2 border-2 ' />	
{/snippet}
{#snippet content()}
	<article class="">
		<ul>
			{#if !data.user?.employee}
				{#each customerLinks as link}
					<li><a class="anchor" href={link.link}>{link.label}</a></li>
				{/each}		
			{/if}
			{#if data.user?.employee}
				{#each employeeLinks as employeeLink}
					<li><a class="anchor" href={employeeLink.link}>{employeeLink.label}</a></li>
				{/each}
			{/if}
			{#if data.user?.admin}
				{#each adminLinks as adminLink}
					<li><a class="anchor" href={adminLink.link}>{adminLink.label}</a></li>
				{/each}
			{/if}
			<div class="absolute bottom-0 p-2 mb-4">
				{#if data.user}
				<li><a href="/accountSettings" class="anchor">Settings</a></li>
					<form action="/logout" method="post" use:enhance>
						<li><button class="anchor" type="submit">Logout</button></li>
					</form>
				{:else}
					<li><a class="anchor" href="/login">Login</a></li>
				{/if}
			</div>
		</ul>
		<button class="absolute top-1 left-[205px] btn-icon" onclick={()=>menuOpen=false}><XCircleIcon /></button>
	</article>
{/snippet}
</Modal>
<div class=" bg-tertiary-50 dark:bg-tertiary-950 fixed top-0 w-full h-9 text-center font-bold p-2">{PUBLIC_COMPANY_NAME}</div>
<div>
	<ToastProvider placement='top-start'>
		{@render children()}
	</ToastProvider>
</div>

