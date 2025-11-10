<script lang="ts">
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
	import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
	import UserAdmin from '$lib/displayComponents/UserAdmin.svelte';
	import AddressForm from '$lib/forms/AddressForm.svelte';
	import OnboardingExistingLease from '$lib/forms/OnboardingExistingLease.svelte';
	import RegisterForm from '$lib/forms/RegisterForm.svelte';
   import type { PageProps } from './$types';

   let { data }: PageProps = $props();
</script>
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
            <OnboardingExistingLease data={data.onboardingExistingLeaseForm} units={data.units} customer={data.customer} address={data.address} />
         {:else}
            <LeaseEmployee lease={data.lease} />

         {/if}
      {/if}
   {/if}
</div>
