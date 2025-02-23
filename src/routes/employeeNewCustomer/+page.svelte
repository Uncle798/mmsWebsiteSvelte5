<script lang="ts">
   import RegisterForm from '$lib/forms/RegisterForm.svelte';
   import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
   import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();
</script>

<RegisterForm data={data.registerForm} formType='employee' redirectTo='employeeNewCustomer' classes='mt-10 m-1 sm:m-2' />

{#if data.customer}
   <UserEmployee user={data.customer} />
   <p><a href="/units/available?userId={data.user?.id}" class="btn">Make a new lease for this customer</a></p>
{/if}
