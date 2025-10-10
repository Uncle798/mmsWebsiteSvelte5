<script lang="ts">
	import '../app.css';
	import { Toast, Tooltip, Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { toaster } from '../lib/toaster';
	import type { PageData } from './$types';
	import Menu from 'lucide-svelte/icons/menu';
	import { beforeNavigate } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { PUBLIC_ADDRESS1, PUBLIC_COMPANY_NAME, PUBLIC_PHONE } from '$env/static/public';
	import { CircleX } from 'lucide-svelte';
	import { setContext } from 'svelte';

	interface Props {
		data: PageData,
		children: import('svelte').Snippet
	}
	let { data, children }:Props = $props();
	interface Link {
		link: string;
		label: string;
		toolTip?: string;
	}
	let customerLinks:Link[] =[
		{link: '/', label: 'Home', },
	]
	let employeeLinks:Link[] = [
		{link: '/', label: 'Home', toolTip: 'Where to display your story and available sizes'},
		{link: '/units', label:'All Units', toolTip: 'See all your units in one place and keep notes about their status'},
		{link: '/units/available', label:'Available Units', toolTip: 'All your available units with open revenue'},
		{link: '/units/unavailable', label: 'Unavailable units', toolTip: 'See which units you\'ve marked unavailable'},
		{link: '/units/recentlyMovedOut', label: 'Recently moved out Units', toolTip: 'See who just left'},
		{link: '/units/size', label: 'Units by size', toolTip: 'Change unit prices and see how much revenue each size generates'},
		{link: '/discounts', label: 'Discounts', toolTip: 'Manage discounts here'},
		{link: '/users/customers', label: 'Customers', toolTip: 'View all current customers here'},
		{link: '/leases', label: 'All Leases', toolTip: 'Find every lease old and new here'},
		{link: '/invoices', label: 'Invoices', toolTip: 'All invoices, may take a second to load'},
		{link: '/invoices/new', label: 'New Invoice', toolTip: 'Create a new invoice, the first step in getting paid'},
		{link: '/invoices/unpaid', label: 'Unpaid invoices', toolTip: 'Open invoices'},
		{link: '/invoices/pastDue', label: 'Past due invoices', toolTip: 'Invoices that are unpaid and past due'},
		{link: '/invoices/year', label: 'Invoices by year', toolTip: 'If you know what year you\'re looking for this will load faster'},
		{link: '/paymentRecords', label: 'Payment Records', toolTip: 'All payment records, may take a second to load'},
		{link: '/paymentRecords/new', label: 'New Payment Record', toolTip: 'Record a payment here'},
		{link: '/paymentRecords/deposits', label: 'Deposits', toolTip: 'Currently held deposits'},
		{link: '/paymentRecords/year', label: 'Payment Records by year', toolTip: 'If you know what year you\'re looking for this will load faster' },
		{link: '/refundRecords', label:'Refund Records', toolTip: 'Track refunds here'},
		{link: '/refundRecords/new', label: 'New Refund Record', toolTip: 'Create a new refund record'},
		{link: '/refundRecords/year', label: 'Refunds by year', toolTip: 'If you know what year you\'re looking for this will load faster'},
		{link: '/employeeNewLease', label:'New lease', toolTip: 'Rent a unit here'},
		{link: '/employeeNewCustomer', label:'New customer', toolTip: 'Create a new customer'},
	]
	let adminLinks:Link[] = [
		{link: '/users', label:'All Users', toolTip: 'Change the employment status of a user here'},
	]
	let menuOpen = $state(false);
	setContext('navMenuOpen', {getMenuOpen: ()=> menuOpen})
	beforeNavigate(() =>{
		menuOpen = false;
	})
	const formattedPhone = PUBLIC_PHONE.substring(0,1) +'-'+ PUBLIC_PHONE.substring(1,4)+'-'+PUBLIC_PHONE.substring(4,7)+'-'+PUBLIC_PHONE.substring(7);
</script>
<Toast.Group {toaster}>
	{#snippet children(toast)}
		<Toast {toast}>
			<Toast.Message>
				<Toast.Title>{toast.title}</Toast.Title>
				<Toast.Description>{toast.description}</Toast.Description>
			</Toast.Message>
			<Toast.CloseTrigger />
		</Toast>
	{/snippet}
</Toast.Group>
{#if data.user?.employee}
	<header>
		<Dialog>
			<Dialog.Trigger class='btn bg-primary-50-950 hover:shadow-xl hover:border-2 border-secondary-50-950 fixed top-0 left-0 z-40 h-12 sm:h-8 rounded-tl-none mainMenu'><Menu aria-label='Main Menu'/></Dialog.Trigger>
			<Portal>
				<Dialog.Backdrop class="fixed inset-0 bg-surface-50-950/50 transition transition-discrete opacity-0 starting:data-[state=open]:opacity-0 data-[state=open]:opacity-100"/>
				<Dialog.Positioner class='fixed inset-0 z-40 flex justify-start rounded-none'>
					<Dialog.Content class="h-screen card bg-surface-100-900 w-[250px] p-4 space-y-4 shadow-xl transition transition-discrete opacity-0 -translate-x-full 
						starting:data-[state=open]:opacity-0 starting:data-[state=open]:-translate-x-full data-[state=open]:opacity-100 data-[state=open]:translate-x-0 rounded-l-none">
						<header class='flex justify-between items-center'>
							<Dialog.Title class='font-bold text-2xl' >Main Menu</Dialog.Title>
							<Dialog.CloseTrigger><CircleX aria-label='close'/></Dialog.CloseTrigger>
						</header>
						<ul>
							{#if data.user.employee}
								{#each employeeLinks as employeeLink}
									<li>
										<Tooltip>
											<Tooltip.Trigger>
												<a href={employeeLink.link} class='anchor'>{employeeLink.label}</a>
											</Tooltip.Trigger>
											<Portal>
												<Tooltip.Positioner class='z-50!'>
													<Tooltip.Content class='card max-w-md p-2 bg-surface-300-700 shadow-xl'>
														{employeeLink.toolTip}
														<Tooltip.Arrow style='--arrow-size: calc(var(--spacing) * 2); --arrow-background: var(--color-surface-300-700);'>
															<Tooltip.ArrowTip />
														</Tooltip.Arrow>
													</Tooltip.Content>
												</Tooltip.Positioner>
											</Portal>
										</Tooltip>
									</li>
								{/each}
							{/if}
							{#if data.user.admin}
								{#each adminLinks as adminLink}
									<li>
										<Tooltip>
											<Tooltip.Trigger>
												<a href={adminLink.link} class="anchor">{adminLink.label}</a>
											</Tooltip.Trigger>
											<Portal>
												<Tooltip.Positioner class='z-50!'>
													<Tooltip.Content class='card max-w-md p-2 bg-surface-300-700 shadow-xl'>
														{adminLink.toolTip}
														<Tooltip.Arrow style='--arrow-size: calc(var(--spacing) * 2); --arrow-background: var(--color-surface-300-700);'>
															<Tooltip.ArrowTip />
														</Tooltip.Arrow>
													</Tooltip.Content>
												</Tooltip.Positioner>
											</Portal>
										</Tooltip>
									</li>	
								{/each}
							{/if}
						</ul>
						<div class="fixed bottom-2">
							<ul>
								<li>
									<Tooltip>
										<Tooltip.Trigger>
											<a href="/accountSettings" class="anchor mx-1">Settings</a>
										</Tooltip.Trigger>
										<Portal>
											<Tooltip.Positioner class='z-50'>
												<Tooltip.Content class='card max-w-md p-2 bg-surface-100-900 shadow-xl'>
													Change your name or address here. View all invoices, payment receipts, and refund records. Best of all, sign up for Auto-pay here.
													<Tooltip.Arrow style='--arrow-size: calc(var(--spacing) * 2); --arrow-background: var(--color-surface-100-900);'>
														<Tooltip.ArrowTip />
													</Tooltip.Arrow>
												</Tooltip.Content>
											</Tooltip.Positioner>
										</Portal>
									</Tooltip>
								</li>
							{#if data.user}
								<form action="/logout" method="post" use:enhance>
									<li><button class="anchor mx-1" type="submit">Logout</button></li>
								</form>
							{:else}
								<li><a class="anchor mx-1" href="/login">Login</a></li>
							{/if}
							</ul>
						</div>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog>
		<div class="bg-tertiary-50-950 fixed w-screen top-0 left-0 h-12 sm:h-9 text-center font-bold z-30 rounded-b-lg">
			<div class="fixed top-0 left-[85px] w-[225px] sm:w-screen text-center sm:left-0 text-wrap">
				<a href="/" class="anchor">{PUBLIC_COMPANY_NAME}</a>
			</div>
		</div>
	</header>
{:else}
	<header>
		<Dialog>
			<Dialog.Trigger class='btn bg-primary-50-950 hover:shadow-xl hover:border-2 border-secondary-50-950 fixed top-0 left-0 z-50 h-12 sm:h-9'><Menu aria-label='Main Menu'/></Dialog.Trigger>
			<Portal>
				<Dialog.Backdrop class="fixed inset-0 bg-surface-50-950/50 transition transition-discrete opacity-0 starting:data-[state=open]:opacity-0 data-[state=open]:opacity-100"/>
				<Dialog.Positioner class='fixed inset-0 z-40 flex justify-start'>
					<Dialog.Content class="h-screen card bg-surface-100-900 w-[200px] p-4 space-y-4 shadow-xl transition transition-discrete opacity-0 -translate-x-full 
						starting:data-[state=open]:opacity-0 starting:data-[state=open]:-translate-x-full data-[state=open]:opacity-100 data-[state=open]:translate-x-0">
						<header class="flex justify-between items-center">
							<Dialog.Title class='text-2xl font-bold'>Main Menu</Dialog.Title>
							<Dialog.CloseTrigger><CircleX aria-label='close'/></Dialog.CloseTrigger>
						</header>
						<ul>
							{#each customerLinks as link}
								<li>
									<a href={link.link}>{link.label}</a>
								</li>
							{/each}
							<div class="absolute bottom-0 m-1 sm:m-2 mb-2  bg-surface-100-900">
								{#if data.user}
								<li><a href="/accountSettings" class="anchor">Settings</a></li>
									<form action="/logout" method="post" use:enhance>
										<li><button class="anchor mx-1" type="submit">Logout</button></li>
									</form>
								{:else}
									<li><a class="anchor mx-1" href="/login">Login</a></li>
								{/if}
							</div>
						</ul>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog>
		<div class="bg-tertiary-50-950 fixed w-screen top-0 left-0 h-12 sm:h-9 text-center font-bold z-30 rounded-b-lg">
			<div class="fixed top-0 left-[85px] w-[225px] sm:w-screen text-center sm:left-0 text-wrap mt-0.5">
				<a href="/" class="anchor">{PUBLIC_COMPANY_NAME}</a>
			</div>
		</div>
	</header>
{/if}

{@render children()}

{#if !data.user?.employee}
	<footer class="bg-tertiary-50-950 fixed bottom-0 w-screen px-2 h-20 sm:h-12 lg:h-7">
		Open 7 days a week from 8:00 am to 8:00 pm we're located at {PUBLIC_ADDRESS1} Moscow ID 83843. Call us at <a href="tel:+{PUBLIC_PHONE}" class="anchor">{formattedPhone}</a>
	</footer>
{:else}
	<footer class="bg-tertiary-50-950 fixed bottom-0 w-screen h-7 text-center rounded-t-lg">
		Powered by <a href="https://www.ministoragemanagementsoftware.com" class="anchor">Ministorage Management Software</a>
	</footer>
{/if}