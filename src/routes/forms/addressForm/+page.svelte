<script lang="ts">
   import { superForm, type SuperValidated, type Infer } from 'sveltekit-superforms';
   import TextInput from '$lib/formComponents/textInput.svelte';
   import countries from '$lib/countryCodes.json'
   import type { PageData } from './$types';
	import { type AddressFormSchema } from '$lib/formSchemas/schemas';

   let {data}: {data:SuperValidated<Infer<AddressFormSchema>>} = $props();
   
   $inspect(data);
   let { form, message, errors, constraints, enhance} = superForm(data, {
      dataType: 'json'
   });
</script>

<h2 class="h2">Update your address</h2>
{#if $message}
    {$message}
{/if}
<form action='/forms/addressForm' method='POST' use:enhance>
    <TextInput
    label='Line 1'
    name='address1'
    bind:value={$form.address1}
    errors={$errors.address1}
    constraints={$constraints.address1}
    placeholder='1700 Mill Road'
    />
    <TextInput
    label='Line 2'
    name='address2'
    bind:value={$form.address2}
    errors={$errors.address2}
    constraints={$constraints.address2}
    placeholder='Unit 1'  
    />
    <div class="flex">
    <TextInput
        label='City'
        name='city'
        bind:value={$form.city}
        errors={$errors.city}
        constraints={$constraints.city}
        placeholder='Moscow'
    />
    <TextInput
        label='State'
        name='state'
        bind:value={$form.state}
        errors={$errors.state}
        constraints={$constraints.state}
        placeholder='ID'
    />
    <TextInput
        label='Zip Code'
        name='zip'
        bind:value={$form.zip}
        errors={$errors.zip}
        constraints={$constraints.zip}
        placeholder='83843'
    />
    </div>
    <select class="select">
    {#each countries as country}
        {#if country['Alpha-2 code'] === 'US'}
            <option value={country['Alpha-2 code']} selected>{country.Country}</option>
            {:else}
            <option value={country['Alpha-2 code']} >{country.Country}</option>
        {/if}
    {/each}
    </select>
</form>