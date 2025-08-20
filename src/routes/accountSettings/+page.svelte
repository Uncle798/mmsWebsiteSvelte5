<script lang="ts">
   import { Modal, ProgressRing } from '@skeletonlabs/skeleton-svelte';
   import type { PageData } from './$types';
   import AddressForm from '$lib/forms/AddressForm.svelte';
   import EmailVerification from '$lib/forms/EmailVerificationForm.svelte'
	import AddressCustomer from '$lib/displayComponents/customerViews/AddressCustomer.svelte';
	import Header from '$lib/Header.svelte';
	import { BadgeCheck, } from 'lucide-svelte';
	import LeaseCustomer from '$lib/displayComponents/customerViews/LeaseCustomer.svelte';
	import LeaseEndForm from '$lib/forms/LeaseEndForm.svelte';
	import { fade } from 'svelte/transition';
	import InvoiceCustomer from '$lib/displayComponents/customerViews/InvoiceCustomer.svelte';
	import PaymentRecordCustomer from '$lib/displayComponents/customerViews/PaymentRecordCustomer.svelte';
	import ThemeSelector from '$lib/displayComponents/ThemeSelector.svelte';
	import UserCustomer from '$lib/displayComponents/customerViews/UserCustomer.svelte';
	import { superForm } from 'sveltekit-superforms';
	import NameChangeForm from '$lib/forms/NameChangeForm.svelte';
	import EmailChangeForm from '$lib/forms/EmailChangeForm.svelte';
    
   let {data}:{ data: PageData} = $props();
   let globalModalOpen = $state(false);
   let modalSelector = $state('')
   let currentLeaseId = $state('');
   let autoPaySpinner = $state(false);
   let autoPayCancelSpinner = $state(false);

   function setCurrentLeaseId(leaseId:string){
      currentLeaseId = leaseId;
      modalSelector = 'leaseEnd';
      globalModalOpen = true;
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
<Modal
   open={globalModalOpen}
   onOpenChange={(e)=> globalModalOpen = e.open}
   contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-(--breakpoint-sm)"
   backdropClasses="backdrop-blur-xs"
>
   {#snippet content()}
      {#if modalSelector === 'emailVerification'}
         {#if data.user}
         <EmailVerification 
            data={data.emailVerificationForm} 
            bind:emailVerificationModalOpen={globalModalOpen} 
            redirect='false' 
            userId={data.user.id}
         />
         {/if}
      {/if}
      {#if modalSelector === 'name'}
         <NameChangeForm data={data.nameForm} bind:nameModalOpen={globalModalOpen} />
      {/if}
      {#if modalSelector === 'email'}
         <EmailChangeForm data={data.emailForm} bind:emailModalOpen={globalModalOpen} />
      {/if}
      {#if modalSelector === 'address'}
         <AddressForm data={data.addressForm} bind:addressModalOpen={globalModalOpen} userId={data.user?.id}/>
      {/if}
      {#if modalSelector === 'leaseEnd'}
         <LeaseEndForm data={data.leaseEndForm} leaseId={currentLeaseId} customer={true} bind:leaseEndModalOpen={globalModalOpen}/>
      {/if}
         <button class="btn preset-filled-primary-50-950 rounded-lg" onclick={()=>globalModalOpen = false}>Cancel</button>
   {/snippet}
</Modal>

<div in:fade={{duration:600}} class="mx-2 mb-24 sm:mb-14 lg:mb-9 mt-14 sm:mt-10">
   <div class="flex flex-col sm:flex-row gap-2">
      <div>
         {#if data.user}
               <UserCustomer user={data.user}/>
         {/if}
         {#if data.user?.emailVerified}
         <div class="flex ">
               Email Verified
               <BadgeCheck size='20' class='mx-1 text-success-50-950'/>
         </div>
         {:else}
            <div class="flex flex-col">
               <button class="btn preset-filled-primary-50-950 mx-2 rounded-lg" onclick={()=>{
                  modalSelector='emailVerification'
                  globalModalOpen=true
               }}>
                  Please confirm your email address
               </button>
            </div>
         {/if}
      </div>
      <div class="flex flex-col sm:flex-row gap-2 mx-2">
         <button class="btn preset-filled-primary-50-950 rounded-lg" onclick={()=>{
            modalSelector='name';
            globalModalOpen=true;
         }}>
            Change Name
         </button>
         <button class="btn preset-filled-primary-50-950 rounded-lg " onclick={()=>{
            modalSelector='email';
            globalModalOpen=true;
         }}>
            Change Email
         </button>
      </div>
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
            globalModalOpen = true;
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
                                    <ProgressRing value={null} size="size-8" strokeWidth="6px" meterStroke="stroke-secondary-600-400" trackStroke="stroke-secondary-50-950" classes='ml-2' />
                              {/if}
                           </div>
                        </form>
                     {:else}
                        <span class="m-2">Thanks for auto-paying!</span>
                        <form action="?/autoPayCancel" use:enhance method="POST">
                           <input type="hidden" name="cuid2Id" id="cuid2Id" value={lease.leaseId} />
                           <button class="btn preset-filled-primary-50-950 rounded-lg m-1 sm:m-2" onclick={()=>autoPayCancel(lease.leaseId)}>Cancel Auto-pay</button>
                           {#if currentLeaseId === lease.leaseId && autoPayCancelSpinner === true}
                              <ProgressRing value={null} size='size-8' strokeWidth='6px' meterStroke="stroke-secondary-600-400" trackStroke="stroke-secondary-50-950" classes='ml-2' />
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
   <ThemeSelector />
</div>
