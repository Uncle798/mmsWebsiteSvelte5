<script lang="ts">
   import RegisterForm from '$lib/forms/RegisterForm.svelte';
   import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
   import type { PageData } from './$types';
	import EmailVerificationForm from '$lib/forms/EmailVerificationForm.svelte';

   let { data }: { data: PageData } = $props();
</script>


{#if data.customer}
   <UserEmployee user={data.customer} classes='mt-12 sm:mt10 mx-2'/>
   <EmailVerificationForm data={data.emailVerificationForm} userId={data.customer.id} classes='mx-2' redirect='false'/>
{:else}
   <RegisterForm data={data.registerForm} formType='employee' redirectTo='employeeNewCustomer' classes='mt-12 sm:mt10 sm:mt-12 sm:mt10 m-1 sm:m-2' />
{/if}
{#if data.customer?.emailVerified}
   <a href="/employeeNewLease?userId={data.customer.id}" class="anchor mx-2">Make a new lease for this customer</a>
{/if}