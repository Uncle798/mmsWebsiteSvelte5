<script lang="ts">
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
	import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
	import PropertyWithLien from '$lib/displayComponents/PropertyWithLien.svelte';
	import UserAdmin from '$lib/displayComponents/UserAdmin.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import OnboardingAddressForm from '$lib/forms/OnboardingAddressForm.svelte';
	import AlternativeContactForm from '$lib/forms/AlternativeContactForm.svelte';
	import OnboardingExistingLease from '$lib/forms/OnboardingExistingLease.svelte';
	import PropertySubjectToLienForm from '$lib/forms/PropertySubjectToLienForm.svelte';
	import Header from '$lib/Header.svelte';
   import type { PageProps } from './$types';
	import Combobox from '$lib/formComponents/Combobox.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import OnboardingRegisterForm from '$lib/forms/OnboardingRegisterForm.svelte';

   let { data }: PageProps = $props();
   let customerComboboxData:{label:string, value:string}[] = [];
   if(data.customers){
      for(const customer of data.customers){
         const label = customer.organizationName ? `${customer.organizationName} (${customer.email})` :  `${customer.givenName} ${customer.familyName} (${customer.email})`
         customerComboboxData.push({
            label,
            value: customer.id
         })
      }
   }
   let addressComboboxData:{label:string, value:string}[] = [];
   if(data.existingAddresses){
      for(const address of data.existingAddresses){
         addressComboboxData.push({
            label: `${address.address1} ${address.city} ${address.state} ${address.postalCode}`,
            value: address.addressId
         })
      }
   }
   const url = page.url
</script>

<Header title='Input Lease Details' />
<div class="mt-10 mx-2">
   {#if !data.customer}  
      <OnboardingRegisterForm data={data.onboardingRegisterForm} formType='employee' redirectTo='onboarding'/>
      {#if customerComboboxData.length > 0}
         <Combobox
            data={customerComboboxData}
            label='or chose current customer'
            onValueChange={(e) => {
               goto(`/onboarding?userId=${e.value[0]}`)
            }}
         />
      {/if}
   {:else}
      <UserAdmin user={data.customer}/>
      {#if !data.address}
         <OnboardingAddressForm data={data.onboardingAddressForm} userId={data.customer.id} redirectTo='onboarding' />
         {#if addressComboboxData.length > 0 }
            <Combobox
               data={addressComboboxData}
               label='or choose existing address'
               onValueChange={(e) => {
                  const userId = url.searchParams.get('userId');
                  if(userId){
                     goto(`/onboarding?userId=${userId}&addressId=${e.value[0]}`)
                  }
               }}
            />
         {/if}
      {:else}
         <AddressEmployee address={data.address} />
         {#if !data.lease}
            <OnboardingExistingLease 
               data={data.onboardingExistingLeaseForm} 
               units={data.units} 
               customer={data.customer} 
               address={data.address} 
            />
         {:else}
            <div>
               <LeaseEmployee lease={data.lease} />
               {#if data.alternativeContact}
                  <UserEmployee user={data.alternativeContact} />
                  {#if data.alternativeAddress}
                     <AddressEmployee address={data.alternativeAddress} />
                  {/if}
               {/if}
               <a href="/onboarding" class="btn preset-filled-primary-50-950">Create another lease</a>
            </div>
            {#if data.alternativeContactForm && !data.alternativeContact}
               <div>
                  <h3 class="h3">Enter the alternative contact info</h3>
               </div>
               <AlternativeContactForm
                  data={data.alternativeContactForm} 
                  leaseId={data.lease.leaseId} 
                  addressId={data.address.addressId}
                  userId={data.customer.id}
                  redirectTo='onboarding'

               />
            {/if}
            {#if data.propertySubjectToLienForm}
               <PropertySubjectToLienForm 
                  data={data.propertySubjectToLienForm} 
                  leaseId={data.lease.leaseId} 
                  redirectTo='onboarding'
                  userId={data.customer.id}
                  addressId={data.address.addressId}
               />
            {/if}
            {#each data.properties as property}
            {@const address = data.lienHolderAddresses.find((address) => address.addressId === property.addressId)}
            {@const contact = data.lienHolderContacts.find((contact) => contact.id === property.userId)}
               <div>
                  <PropertyWithLien {property} />
                  {#if contact}
                     <UserEmployee user={contact} />
                  {/if}
                  {#if address}
                     <AddressEmployee address={address} />
                  {/if}
               </div>
            {/each}
         {/if}
      {/if}
   {/if}
</div>
