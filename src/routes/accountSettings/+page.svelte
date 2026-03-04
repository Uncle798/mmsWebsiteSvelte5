<script lang="ts">
   import type { PageData } from './$types';
   import AddressForm from '$lib/forms/AddressForm.svelte';
   import EmailVerification from '$lib/forms/EmailVerificationForm.svelte'
	import AddressCustomer from '$lib/displayComponents/customerViews/AddressCustomer.svelte';
	import Header from '$lib/Header.svelte';
	import { BadgeCheck, MenuIcon, } from 'lucide-svelte';
	import LeaseCustomer from '$lib/displayComponents/customerViews/LeaseCustomer.svelte';
	import LeaseEndForm from '$lib/forms/LeaseEndForm.svelte';
	import { fade } from 'svelte/transition';
	import InvoiceCustomer from '$lib/displayComponents/customerViews/InvoiceCustomer.svelte';
	import PaymentRecordCustomer from '$lib/displayComponents/customerViews/PaymentRecordCustomer.svelte';
	import UserCustomer from '$lib/displayComponents/customerViews/UserCustomer.svelte';
	import { superForm } from 'sveltekit-superforms';
	import NameChangeForm from '$lib/forms/NameChangeForm.svelte';
	import EmailChangeForm from '$lib/forms/EmailChangeForm.svelte';
	import FormModal from '$lib/displayComponents/Modals/FormModal.svelte';
   import ProgressRing from '$lib/displayComponents/ProgressRing.svelte';
	import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';

   let {data}:{ data: PageData} = $props();
   let modalOpen = $state(false);
   let modalSelector = $state('')
   let currentLeaseId = $state('');
   let autoPaySpinner = $state(false);
   let autoPayCancelSpinner = $state(false);

   function setCurrentLeaseId(leaseId:string){
      currentLeaseId = leaseId;
      modalSelector = 'leaseEnd';
      modalOpen = true;
   }
   function autoPaySignUp(leaseId:string){
      currentLeaseId = leaseId;
      autoPaySpinner = true;
      submit()
   } 
   function autoPayCancel(leaseId:string){
      currentLeaseId = leaseId;
      autoPayCancelSpinner = true;
      submit()
   }
   let { form, enhance, submit } = superForm(data.autoPayForm)
</script>
<Header title='Settings for {data.user?.givenName}' />
<FormModal
   bind:modalOpen={modalOpen}
>
   {#snippet content()}
      {#if modalSelector === 'emailVerification'}
         {#if data.user}
         <EmailVerification 
            data={data.emailVerificationForm} 
            bind:emailVerificationModalOpen={modalOpen} 
            redirect='false' 
            userId={data.user.id}
         />
         {/if}
      {/if}
      {#if modalSelector === 'name'}
         <NameChangeForm data={data.nameForm} bind:nameModalOpen={modalOpen} userId={data.user!.id} />
      {/if}
      {#if modalSelector === 'email'}
         <EmailChangeForm data={data.emailForm} bind:emailModalOpen={modalOpen} user={data.user!}/>
      {/if}
      {#if modalSelector === 'address'}
         <AddressForm data={data.addressForm} bind:addressModalOpen={modalOpen} userId={data.user?.id}/>
      {/if}
      {#if modalSelector === 'leaseEnd'}
         <LeaseEndForm data={data.leaseEndForm} leaseId={currentLeaseId} employee={false} bind:leaseEndModalOpen={modalOpen}/>
      {/if}
   {/snippet}
</FormModal>

<div in:fade={{duration:600}} class="mx-2 mb-24 sm:mb-14 lg:mb-9 mt-14 sm:mt-10">
   <div class="relative min-h-40">
      {#if data.user}
         <UserCustomer user={data.user} classes='absolute left-18 top-0'/>
      {/if}
      <Menu 
         onSelect={(d) => {
            switch (d.value) {
               default:
                  modalSelector = d.value;
                  modalOpen = true;
                  
                  break;
            }
         }}
      >
         <Menu.Trigger class='btn preset-filled-primary-50-950 absolute top-0 left-0'><MenuIcon class='size-5' aria-label='User menu'/></Menu.Trigger>
         <Portal>
            <Menu.Positioner>
               {#if !data.user?.emailVerified}                  
                  <Menu.Item value='emailVerification'>
                     <Menu.ItemText>Verify email address</Menu.ItemText>
                  </Menu.Item>
               {/if}
               <Menu.Item value='name'>
                  <Menu.ItemText>Change name</Menu.ItemText>
               </Menu.Item>
               <Menu.Item value='email'>
                  <Menu.ItemText>Change email</Menu.ItemText>
               </Menu.Item>
            </Menu.Positioner>
         </Portal>
      </Menu>
      {#if data.user?.emailVerified}
         <BadgeCheck size='20' class='mx-1 text-success-50-950 absolute top-7 left-7'/>
      {/if}
   </div>
   <div class="flex flex-col sm:flex-row gap-3">
      {#await data.addressPromise}
         ...loading address
      {:then address} 
      {#if address}
         <AddressCustomer {address} classes=''/>
      {/if}
         <button class="btn preset-filled-primary-50-950 m-1 sm:m-2 rounded-lg" onclick={()=> {
            modalSelector = 'address'
            modalOpen = true;
         }}>
            {#if address}
               Change address
            {:else}
               Add address
            {/if}
         </button>
      {/await}
   </div>
   {#await data.leasesPromise}
      ...loading leases
   {:then leases}
      {#if leases}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 my-2">
         {#each leases as lease}
               <div class="border-2 rounded-lg border-primary-50-950 flex flex-col">
                  <LeaseCustomer lease={lease} classes=''/>
                  {#if !lease.leaseEnded}
                     <button class="btn preset-filled-primary-50-950 rounded-lg m-1 sm:m-2" onclick={()=> setCurrentLeaseId(lease.leaseId)}>End Lease</button>
                     {#if !lease.subscriptionId}
                        <form method="POST" action="?/autoPaySignUp" use:enhance>
                           <input type="hidden" name="cuid2Id" id="cuid2Id" value={lease.leaseId}>
                           <div class="flex">
                              <button type="button" class='btn preset-filled-primary-50-950 rounded-lg m-1 sm:m-2' onclick={()=>autoPaySignUp(lease.leaseId)}>Sign up for auto pay</button>
                              {#if currentLeaseId === lease.leaseId && autoPaySpinner === true}                                
                                    <ProgressRing value={null} />
                              {/if}
                           </div>
                        </form>
                     {:else}
                        <span class="m-2">Thanks for auto-paying!</span>
                        <form action="?/autoPayCancel" use:enhance method="POST">
                           <input type="hidden" name="cuid2Id" id="cuid2Id" value={lease.leaseId} />
                           <button class="btn preset-filled-primary-50-950 rounded-lg m-1 sm:m-2" onclick={()=>autoPayCancel(lease.leaseId)}>Cancel Auto-pay</button>
                           {#if currentLeaseId === lease.leaseId && autoPayCancelSpinner === true}
                              <ProgressRing value={null} />
                           {/if}
                        </form>
                     {/if}
                  {/if}
               </div>
         {/each}
      </div>
      {/if}
   {/await}
   <div class="grid grid-cols-1 gap-x-1 gap-y-2 ">
      {#await data.invoicesPromise}
         Loading invoices...
      {:then invoices} 
         {#await data.paymentsPromise}
               Loading payments...
         {:then payments} 
               <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-1 gap-y-3">
                  {#each invoices as invoice}
                  {@const paymentRecord = payments.find((payment) => payment.invoiceNum === invoice.invoiceNum)}
                     <InvoiceCustomer {invoice} classes="border-2 border-primary-50-950 rounded-lg"/>
                     {#if paymentRecord}
                           <PaymentRecordCustomer {paymentRecord} classes="border-2 border-primary-50-950 rounded-lg"/>
                     {/if}
                  {/each}
               </div>
         {/await}
      {/await}
   </div>
</div>
