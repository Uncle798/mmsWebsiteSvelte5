<script lang="ts">
	import '../app.css';
	import { ToastProvider, Tooltip } from '@skeletonlabs/skeleton-svelte';
	import type { PageData } from './$types';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import Menu from 'lucide-svelte/icons/menu';
	import { beforeNavigate } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { PUBLIC_ADDRESS1, PUBLIC_COMPANY_NAME, PUBLIC_PHONE } from '$env/static/public';
	import { XCircleIcon } from 'lucide-svelte';

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

	beforeNavigate(() =>{
		menuOpen = false;
	})
	const formattedPhone = PUBLIC_PHONE.substring(0,1) +'-'+ PUBLIC_PHONE.substring(1,4)+'-'+PUBLIC_PHONE.substring(4,7)+'-'+PUBLIC_PHONE.substring(7);
	let tooltipOpenIdentifier = $state<string|null>(null);
</script>

{#if data.user?.employee}
	<header> 
		<Modal
			bind:open={menuOpen}
			triggerBase="btn bg-primary-50-950 hover:shadow-xl hover:border-2 border-secondary-50-950 fixed top-0 left-0 z-50"
			contentBase="bg-surface-100-900 space-y-2 shadow-xl w-[240px] h-screen"
			positionerJustify="justify-start"
			positionerAlign=""
			positionerPadding=""
			transitionsPositionerIn={{ x: -280, duration: 400 }}
			transitionsPositionerOut={{ x: -280, duration: 400 }}
		>
			{#snippet trigger()}
				<Menu class='mx-2 border-2 z-50' />	
			{/snippet}
			{#snippet content()}
				<article class="h-full">
					<ul class="overflow-auto h-8/9 m-1">
						{#if data.user?.employee}
							{#each employeeLinks as employeeLink}
								<li>
									<Tooltip
										open={tooltipOpenIdentifier === employeeLink.link}
										onOpenChange={(event) => {
											if(event.open){
												tooltipOpenIdentifier = employeeLink.link
											} else if (tooltipOpenIdentifier === employeeLink.link){
												tooltipOpenIdentifier = null
											}
										}}
										positioning={{placement: 'top-end'}}
										contentBase="card preset-filled p-2"
										openDelay={200}
										zIndex='30'
									>
										{#snippet content()}
											{employeeLink.toolTip}
										{/snippet}
										{#snippet trigger()}
											<a class="anchor" href={employeeLink.link}>{employeeLink.label}</a>
										{/snippet}
									</Tooltip>
								</li>
							{/each}
						{/if}
						{#if data.user?.admin}
							{#each adminLinks as adminLink}
								<Tooltip
									open={tooltipOpenIdentifier === adminLink.link}
									onOpenChange={(event) => {
										if(event.open){
											tooltipOpenIdentifier = adminLink.link
										} else if (tooltipOpenIdentifier === adminLink.link){
											tooltipOpenIdentifier = null
										}
									}}
									positioning={{placement: 'top-end'}}
									contentBase="card preset-filled p-2"
									openDelay={200}
									zIndex='30'
								>
								{#snippet content()}
									{adminLink.toolTip}
								{/snippet}
								{#snippet trigger()}
									<li><a class="anchor" href={adminLink.link}>{adminLink.label}</a></li>
								{/snippet}
								</Tooltip>
							{/each}
						{/if}
					</ul>
					<div class="fixed w-[240px] bottom-0 bg-surface-100-900 border-1 border-primary-50-950 rounded-lg">
						<ul class="m-1">
							{#if data.user}
							<Tooltip
								open={tooltipOpenIdentifier === '/accountSettings'}
								onOpenChange={(event) => {
									if(event.open){
										tooltipOpenIdentifier = '/accountSettings'
									} else if (tooltipOpenIdentifier === '/accountSettings'){
										tooltipOpenIdentifier = null
									}
								}}
								positioning={{placement: 'top-end'}}
								contentBase="card preset-filled p-2"
								openDelay={200}
								zIndex='30'
							>
								{#snippet content()}
									Change your name or address here. View all invoices, payment receipts, and refund records. Best of all, sign up for Auto-pay here.
								{/snippet}
								{#snippet trigger()}
									<li><a href="/accountSettings" class="anchor">Settings</a></li>
								{/snippet}
							</Tooltip>
								<form action="/logout" method="post" use:enhance>
									<li><button class="anchor" type="submit">Logout</button></li>
								</form>
							{:else}
								<li><a class="anchor" href="/login">Login</a></li>
							{/if}
						</ul>
					</div>
					<button class="absolute top-1 left-[205px] btn-icon" onclick={()=>{menuOpen=false}}><XCircleIcon aria-label='close' class=''/></button>
				</article>
			{/snippet}
		</Modal>
		<div class="bg-tertiary-50-950 fixed w-screen top-0 left-0 h-12 sm:h-9 text-center font-bold z-30 rounded-b-lg">
			<div class="fixed top-0 left-[90px] w-[225px] sm:w-screen text-center sm:left-0 text-wrap">
				<a href="/" class="anchor">{PUBLIC_COMPANY_NAME}</a>
			</div>
		</div>
	</header>
{:else}
	<header> 
		<Modal
			bind:open={menuOpen}
			triggerBase="btn bg-primary-50-950 hover:shadow-xl hover:border-2 border-secondary-50-950 fixed top-0 left-0 z-50 h-12 sm:h-9"
			contentBase="bg-surface-100-900 p-2 space-y-2 shadow-xl w-[125px] h-screen"
			positionerJustify="justify-start"
			positionerAlign=""
			positionerPadding=""
			transitionsPositionerIn={{ x: -125, duration: 400 }}
			transitionsPositionerOut={{ x: -125, duration: 400 }}
		>
		{#snippet trigger()}
			<Menu class='mx-2 border-2 z-50' aria-label='Main Menu'/>	
		{/snippet}
		{#snippet content()}
			<article class="">
				<button class="absolute top-1 left-[90px] btn-icon" onclick={()=>{menuOpen=false}}><XCircleIcon aria-label='close' class='h-12 sm:h-9'/></button>
				<ul>
					{#each customerLinks as link}
						<a href={link.link} class="anchor">{link.label}</a>
					{/each}
					<div class="absolute bottom-0 m-1 sm:m-2 mb-2  bg-surface-100-900">
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
				
			</article>
		{/snippet}
		</Modal>
		<div class="bg-tertiary-50-950 fixed w-screen top-0 left-0 h-12 sm:h-9 text-center font-bold z-30 rounded-b-lg">
			<div class="fixed top-0 left-[90px] w-[225px] sm:w-screen text-center sm:left-0 text-wrap">
				<a href="/" class="anchor">{PUBLIC_COMPANY_NAME}</a>
			</div>
		</div>
	</header>
{/if}
	<ToastProvider placement='top-start'>
		{@render children()}
	</ToastProvider>

{#if !data.user?.employee}
	<footer class="bg-tertiary-50-950 fixed bottom-0 right-0 w-screen px-2 h-20 sm:h-12 lg:h-7">
		Open 7 days a week from 8:00 am to 8:00 pm we're located at {PUBLIC_ADDRESS1} Moscow ID 83843. Call us at <a href="tel:+{PUBLIC_PHONE}" class="anchor">{formattedPhone}</a>
	</footer>
{/if}