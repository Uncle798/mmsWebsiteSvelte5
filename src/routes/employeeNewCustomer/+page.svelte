<script lang="ts">
   import RegisterForm from '$lib/forms/RegisterForm.svelte';
   import User from '$lib/displayComponents/User.svelte';
   import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();
</script>

<RegisterForm data={data.registerForm} formType='employee' redirectTo='employeeNewCustomer'/>

{#if data.user}
   <User user={data.user} />
   <p><a href="/units/available?userId={data.user?.id}" class="btn">Make a new lease for this customer</a></p>
{/if}
