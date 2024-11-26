<script lang="ts">
   import { superForm, type SuperValidated, type Infer } from 'sveltekit-superforms';
   import TextInput from '$lib/formComponents/TextInput.svelte';
   import countries from '$lib/countryCodes.json'
	import { type AddressFormSchema } from '$lib/formSchemas/schemas';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import FormProgress from '$lib/formComponents/FormSubmitWithProgress.svelte';
	import FormMessage from '$lib/formComponents/FormMessage.svelte';

   let {data, addressModalOpen=$bindable(false), userId }: {
      data:SuperValidated<Infer<AddressFormSchema>>, 
      addressModalOpen:boolean,
      userId: string
      } = $props();
   let { form, message, errors, constraints, enhance, delayed, timeout} = superForm(data, {
      onUpdate() {
         if(!$message){
            addressModalOpen=false;
         }
         invalidateAll();
      },
      delayMs: 500,
      timeoutMs: 8000,
   });
   onMount(() => {
   if (typeof window !== 'undefined') {
      import('@mapbox/search-js-web').then(({ config, autofill }) => {
         /* cspell:disable-next-line */
         config.accessToken = 'pk.eyJ1IjoiZXJpY2JyYW5zb24iLCJhIjoiY20wYjh6b29yMDE4dDJqb2sxc3ZjZHgzMyJ9.3kAYNtGfsqEPi8a3Zlvlzg';
         autofill({
         options: {
            country: 'us'
         }
         });
      }).catch((error) => {
         console.error('Error loading Mapbox Search JS:', error);
      });
   }
   });
</script>

<span class="h2">Update your address</span>
<FormMessage message={$message} />
<form action='/forms/addressForm?userId={userId}' method='POST' use:enhance>
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
      <FormProgress delayed={$delayed} timeout={$timeout}/>
</form>