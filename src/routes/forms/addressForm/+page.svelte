<script lang="ts">
   import { superForm, type SuperValidated, type Infer } from 'sveltekit-superforms';
   import TextInput from '$lib/formComponents/textInput.svelte';
   import countries from '$lib/countryCodes.json'
	import { type AddressFormSchema } from '$lib/formSchemas/schemas';
	import { Progress, ProgressRing } from '@skeletonlabs/skeleton-svelte';

   let {data, addressModalOpen=$bindable(false)}: {
      data:SuperValidated<Infer<AddressFormSchema>>, 
      addressModalOpen:boolean,
      } = $props();
   let { form, message, errors, constraints, enhance, delayed, timeout} = superForm(data, {
      onUpdate() {
         addressModalOpen=false;
      },
      delayMs: 500,
      timeoutMs: 8000,
   });
</script>

<span class="h2">Update your address</span>
{#if $message}
   <span>{$message} </span>
{/if}
<form action='/forms/addressForm' method='POST' use:enhance>
    <TextInput
      bind:value={$form.address1}
      errors={$errors.address1}
      constraints={$constraints.address1}
      label='Line 1'
      name='address1'
      placeholder='1700 Mill Road'
    />
    <TextInput
      bind:value={$form.address2}
      errors={$errors.address2}
      constraints={$constraints.address2}
      name='address2'
      label='Line 2'
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
    <label for="country">Country
       <select class="select" name='country'>
          {#each countries as country}
            {#if country['Alpha-2 code'] === 'US'}
               <option value={country['Alpha-2 code']} selected>{country.Country}</option>
            {:else}
               <option value={country['Alpha-2 code']} >{country.Country}</option>
            {/if}
          {/each}
      </select>
   </label>
   <button class="btn">Submit</button>
   {#if $delayed && !$timeout}
      <ProgressRing value={null} size="size-14" meterStroke="stroke-tertiary-600-400" trackStroke="stroke-tertiary-50-950" />
   {/if}
   {#if $timeout}
      <Progress value={null} />
   {/if}
</form>