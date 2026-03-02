<script lang="ts">
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
	import LeaseCustomer from '$lib/displayComponents/customerViews/LeaseCustomer.svelte';
	import UserCustomer from '$lib/displayComponents/customerViews/UserCustomer.svelte';
   import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
   import Header from '$lib/Header.svelte';
	import { fade } from 'svelte/transition';
   import type { PageData } from './$types';
   import LeaseEndForm from '$lib/forms/LeaseEndForm.svelte';
	import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
	import FormModal from '$lib/displayComponents/Modals/FormModal.svelte';
	import AlternativeContactForm from '$lib/forms/AlternativeContactForm.svelte';
	import AlternativeContactRemovalForm from '$lib/forms/AlternativeContactRemovalForm.svelte';
	import LeaseChangeForm from '$lib/forms/LeaseChangeForm.svelte';
	import Button from '$lib/core/Button.svelte';
	import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';
	import { MenuIcon } from 'lucide-svelte';
	import LeaseDeleteForm from '$lib/forms/LeaseDeleteForm.svelte';

   let { data }: { data: PageData } = $props();
   let modalOpen = $state(false);
   let modalReason = $state('');
   let currentAlternativeContactId = $state('');
</script>
<Header title='Lease {data.lease?.leaseId}' />
{#if  data.lease}   
   <FormModal
      bind:modalOpen={modalOpen}
   >
      {#snippet content()}
         {#if modalReason === 'leaseEnd' && data.lease}
            <LeaseEndForm data={data.leaseEndForm} leaseId={data.lease.leaseId} bind:leaseEndModalOpen={modalOpen} />
         {:else if modalReason === 'alternativeContact'}
            <AlternativeContactForm data={data.alternativeContactForm} bind:modalOpen={modalOpen} />
         {:else if modalReason === 'alternativeContactRemoval'}
            <AlternativeContactRemovalForm data={data.removeAlternativeContactForm} alternativeContactId={currentAlternativeContactId} bind:modalOpen={modalOpen} />
         {:else if modalReason === 'leaseChange' && data.lease}
            <LeaseChangeForm data={data.leaseChangeForm} lease={data.lease} bind:modalOpen={modalOpen}/>
         {:else if modalReason === 'leaseDelete' && data.lease}
            <LeaseDeleteForm data={data.leaseDeleteForm} lease={data.lease} bind:modalOpen={modalOpen} />
         {/if}
      {/snippet}
   </FormModal>
{/if}
{#if data.user?.employee}   
   <div class="mt-14 sm:mt-10 mb-8 mx-2">
      {#if data.lease}
         <div class="border-2 rounded-lg border-primary-50-950 relative flex flex-col sm:flex-row">
            <LeaseEmployee lease={data.lease} open={true} classes='place-self-start mx-2'/>
            <Menu onSelect={(e) => {
               switch (e.value) {
                  default:
                     modalReason = e.value;
                     modalOpen = true;
                     break;
               }
            }}>
               <Menu.Trigger class='absolute top-1 left-1'><MenuIcon aria-label='Lease menu' class='preset-filled-primary-50-950 rounded-sm p-1 size-8'/></Menu.Trigger>
               <Portal>
                  <Menu.Positioner>
                     <Menu.Content>
                        <Menu.Item value='alternativeContact' disabled={data.lease.leaseEnded ? true : undefined}>
                           <Menu.ItemText>Add alternative contact</Menu.ItemText>
                        </Menu.Item>
                        <Menu.Item value='leaseChange' disabled={data.lease.leaseEnded ? true : undefined}>
                           <Menu.ItemText>Edit lease details</Menu.ItemText>
                        </Menu.Item>
                        <Menu.Item value='leaseEnd' disabled={data.lease.leaseEnded ? true : undefined}>
                           <Menu.ItemText>End lease</Menu.ItemText>
                        </Menu.Item>
                        <Menu.Item value='leaseDelete' disabled={data.lease.leaseEnded ? undefined : true} >
                           <Menu.ItemText>Delete lease</Menu.ItemText>
                        </Menu.Item>
                     </Menu.Content>
                  </Menu.Positioner>
               </Portal>
            </Menu>
            <div class="m-1 sm:m-2">
               {#if data.customer}
                  <UserEmployee user={data.customer} classes=''/>
               {/if}
               {#if data.address}
                  {#if data.currentAddress}
                     <AddressEmployee address={data.address} classes='' />
                  {:else}
                     <AddressEmployee address={data.address} classes=''/>
                  {/if}
               {/if}
               {#if data.currentAddress}
                  <AddressEmployee address={data.currentAddress} classes=''/>
               {/if}
            </div>
            <div>             
               {#each data.alternativeContacts as user}
               {@const address = data.alternativeContactAddresses.find((address) => address.userId === user.id)}
                  <div class="flex flex-col">
                     <UserEmployee {user} />
                     {#if address}
                        <AddressEmployee {address} />
                     {/if}
                     <Button
                        type='button'
                        label='Remove alternative contact'
                        onClick={() => {
                           modalReason = 'alternativeContactRemoval';
                           modalOpen = true;
                           currentAlternativeContactId = user.id
                        }}
                     />
                  </div>
               {/each}
            </div>
         </div>
      {/if}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
         {#each data.invoices as invoice}
            <div class="border border-primary-50-950 rounded-lg">
               <InvoiceEmployee invoice={invoice} classes='p-2'/>
               {#if invoice.amountPaid < invoice.invoiceAmount}
                  <a href="/paymentRecord/new?invoiceNum={invoice.invoiceNum}" class="btn preset-filled-primary-50-950 h-8 m-2">Make a payment record for this invoice</a>
               {/if}
            </div>
         {/each}
      </div>
   </div>
{:else}
   <div class="flex flex-col sm:flex-row mt-14 mx-1 sm:mx-2" in:fade={{duration:600}} out:fade={{duration:0}}>
      {#if data.lease}
         <LeaseCustomer lease={data.lease} />
      {/if}
      {#if data.customer}
         <UserCustomer user={data.customer} />
      {/if}
   </div>
{/if}