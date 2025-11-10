<script lang="ts">
   import { superForm, type SuperValidated, type Infer } from 'sveltekit-superforms';
   import TextInput from '$lib/formComponents/TextInput.svelte';
   import countries from '$lib/countryCodes.json'
   import dialCodes from '$lib/dialCodes.json'
	import PhoneInput from '$lib/formComponents/PhoneInput.svelte';
   import { type AddressFormSchema } from '$lib/formSchemas/addressFormSchema';
	import { invalidateAll } from '$app/navigation';
	import FormProgress from '$lib/formComponents/FormSubmitWithProgress.svelte';
	import FormMessage from '$lib/formComponents/FormMessage.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/state';

   interface Props {
      data: SuperValidated<Infer<AddressFormSchema>>, 
      addressModalOpen?: boolean,
      userId?: string,
      redirectTo?: string,
      classes?: string
   }

   let {data, addressModalOpen=$bindable(false), userId, redirectTo, classes }:Props = $props();
   let { form, message, errors, constraints, enhance, delayed, timeout, capture, restore, } = superForm(data, {
      onChange(event) {
         if(event.target){
            const key = `${url}/addressForm/userId=${userId}:${event.path}`
            const value = event.get(event.path);
            if(value){
               sessionStorage.setItem(`${key}:${event.path}`, value);
            }
         }
      },
      onSubmit({formData}) {
         formData.set('phoneNum1', $form.phoneNum1.replace(/\D/g, ''));
      },
      onUpdated() {
         if(!$message || !$errors){
            addressModalOpen=false;
            invalidateAll();
         }
      },
      delayMs: 500,
      timeoutMs: 8000,
   });
   export const snapshot = {
      capture,
      restore,
   }
   const url = page.url.pathname
   onMount(() =>{
      for(const key in $form){
         const fullKey = `${url}/addressForm/userId=${userId}:${key}`;
         const storedValue = sessionStorage.getItem(fullKey)
         if(storedValue){
            $form[key as keyof typeof $form] = storedValue;
         }
      }
   })
</script>
<div class={classes}>
   <FormMessage message={$message} />
   <form action='/forms/addressForm?redirectTo={redirectTo}' method='POST' use:enhance>
      <TextInput
         bind:value={$form.address1}
         errors={$errors.address1}
         constraints={$constraints.address1}
         label='Line 1'
         name='address1'
         placeholder='1700 Mill Road'
         autocomplete='address-line1'
      />
      <TextInput
         bind:value={$form.address2}
         errors={$errors.address2}
         constraints={$constraints.address2}
         name='address2'
         label='Line 2'
         placeholder='Unit 1'  
         autocomplete='address-line2'
      />
      <div class="flex flex-col sm:flex-row gap-x-2">
      <TextInput
         label='City'
         name='city'
         bind:value={$form.city}
         errors={$errors.city}
         constraints={$constraints.city}
         placeholder='Moscow'
         autocomplete='address-level2'
      />
      <TextInput
         label='State'
         name='state'
         bind:value={$form.state}
         errors={$errors.state}
         constraints={$constraints.state}
         placeholder='ID'
         autocomplete='address-level1'
      />
      <TextInput
         label='Zip Code'
         name='postalCode'
         bind:value={$form.postalCode}
         errors={$errors.postalCode}
         constraints={$constraints.postalCode}
         placeholder='83843'
         autocomplete='postal-code'
      />
      </div>
      <label for="country" class="label">Country
         <select class="select p-2" name='country' autocomplete="country">
            {#each countries as country}
               {#if country['Alpha-2 code'] === 'US'}
                  <option value={country['Alpha-2 code']} selected>{country.Country}</option>
               {:else}
                  <option value={country['Alpha-2 code']} >{country.Country}</option>
               {/if}
            {/each}
         </select>
      </label>
      <div class="input-group divide-surface-200-800 grid-cols-[auto_1fr_auto] divide-x mt-2">
         <div class="ig-cell w-32 sm:w-48">
            <label for="phoneNum1Country" class="label-text">
               Country Code
               <select class="ig-select select " name="phoneNum1Country" id="phoneNum1Country" autocomplete="tel-country-code">
                  {#each dialCodes as dialCode}
                     {#if dialCode.code === "US"}
                        <option value={dialCode.dial_code} selected>{dialCode.dial_code} ({dialCode.name})</option>
                     {:else}
                        <option value={dialCode.dial_code}>{dialCode.dial_code} ({dialCode.name})</option>
                     {/if}
                  {/each}
               </select>
            </label>
         </div>
         <div class="ig-cell">
            <PhoneInput
               bind:value={$form.phoneNum1}
               errors={$errors.phoneNum1}
               constraints={$constraints.phoneNum1}
               label='Phone'
               name='phoneNum1'
            />
         </div>
      </div>
      <input type="hidden" value={userId} name="userId"/>
      <FormProgress delayed={$delayed} timeout={$timeout}/>
   </form>
</div>