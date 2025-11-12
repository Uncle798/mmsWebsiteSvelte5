<script lang="ts">
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
	import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
	import PropertyWithLien from '$lib/displayComponents/PropertyWithLien.svelte';
	import UserAdmin from '$lib/displayComponents/UserAdmin.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import AddressForm from '$lib/forms/AddressForm.svelte';
	import AlternativeContactForm from '$lib/forms/AlternativeContactForm.svelte';
	import OnboardingExistingLease from '$lib/forms/OnboardingExistingLease.svelte';
	import PropertySubjectToLienForm from '$lib/forms/PropertySubjectToLienForm.svelte';
	import RegisterForm from '$lib/forms/RegisterForm.svelte';
	import Header from '$lib/Header.svelte';
   import type { PageProps } from './$types';

   let { data }: PageProps = $props();
</script>

<Header title='Input Lease Details' />
<div class="mt-10 mx-2">
   {#if !data.customer}  
      <RegisterForm data={data.registerForm} formType='employee' redirectTo='onboarding'/>
   {:else}
      <UserAdmin user={data.customer}/>
      {#if !data.address}
         <AddressForm data={data.addressForm} userId={data.customer.id} redirectTo='onboarding'/>
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
            <LeaseEmployee lease={data.lease} />
            {#if data.alternativeContactForm}
               <div>
                  <h3 class="h3">Enter the alternative contact info</h3>
               </div>
               <AlternativeContactForm data={data.alternativeContactForm} leaseId={data.lease.leaseId} />
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
