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
	import Combobox from '$lib/formComponents/Combobox.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import LeaseChangeForm from '$lib/forms/LeaseChangeForm.svelte';
	import Button from '$lib/core/Button.svelte';

   let { data }: { data: PageData } = $props();
   let modalOpen = $state(false);
   let modalReason = $state('');
   let currentAlternativeContactId = $state('');
   const comboboxData:{label:string, value:string}[] = [];
   for(const altContact of data.allAlternativeContacts){
      comboboxData.push({label: `${altContact.givenName} ${altContact.familyName}`, value: altContact.id})
   }
</script>
<Header title='Lease {data.lease?.leaseId}' />
{#if  data.lease}   
   <FormModal
      bind:modalOpen={modalOpen}
   >
      {#snippet content()}
         {#if modalReason === 'leaseEnd'}
            <LeaseEndForm data={data.leaseEndForm} leaseId={data.lease!.leaseId} bind:leaseEndModalOpen={modalOpen} />
         {:else if modalReason === 'alternativeContact'}
            <AlternativeContactForm data={data.alternativeContactForm} leaseId={data.lease!.leaseId} bind:modalOpen={modalOpen} />
         {:else if modalReason === 'alternativeContactRemoval'}
            <AlternativeContactRemovalForm data={data.removeAlternativeContactForm} alternativeContactId={currentAlternativeContactId} bind:modalOpen={modalOpen} />
         {:else if modalReason === 'leaseChange'}
            <LeaseChangeForm data={data.leaseChangeForm} lease={data.lease!} bind:modalOpen={modalOpen}/>
         {/if}
      {/snippet}
   </FormModal>
{/if}
{#if data.user?.employee}   
   <div class="mt-14 sm:mt-10 mb-8">
      {#if data.lease}
         <div class="border rounded-lg border-primary-50-950 flex flex-col sm:flex-row mx-2">
            <LeaseEmployee lease={data.lease} open={true} classes=''/>
            <div class="flex flex-col gap-2 mt-2">
               <Button
                  label='Add alternative contact'
                  type='button'
                  onClick={() =>{
                     modalReason = 'alternativeContact';
                     modalOpen = true;
                  }}
               />
               <Button
                  label='Change lease details'
                  type='button'
                  onClick={() => {
                     modalReason = 'leaseChange'
                     modalOpen = true;
                  }}
               />
               {#if !data.lease.leaseEnded}
                  <Button
                     type='button'
                     label='End lease'
                     onClick={() => {
                        modalReason = 'leaseEnd';
                        modalOpen = true;
                     }}
                  />
               {:else}
                  <Button
                     type="button"
                     label='Delete lease'
                     onClick={async () => {
                        const response = await fetch('/api/leases', {
                           method: 'DELETE',
                           body: JSON.stringify({leaseId: data.lease?.leaseId})
                        });
                        if(response.status === 200){
                           goto('/leases');
                        }
                     }}
                  />
               {/if}
            </div>
            <div class="m-1 sm:m-2">
               {#if data.customer}
                  <UserEmployee user={data.customer} classes='mx-2'/>
               {/if}
               {#if data.address}
                  {#if data.currentAddress}
                  <label class="label-text">Lease Address:
                     <AddressEmployee address={data.address} classes='text-base mx-2' />
                  </label>
                  {:else}
                     <AddressEmployee address={data.address} classes='mx-2'/>
                  {/if}
               {/if}
               {#if data.currentAddress}
                  <label >Current address
                     <AddressEmployee address={data.currentAddress} classes='mx-2'/>
                  </label>
                  
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