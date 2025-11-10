<script lang="ts">
   import type { AddressFormSchema } from '$lib/formSchemas/addressFormSchema';
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
	import TextArea from "$lib/formComponents/TextArea.svelte";
	import type { PropertySubjectToLienSchema } from '$lib/formSchemas/propertySubjectToLienSchema';
	import TextInput from '$lib/formComponents/TextInput.svelte';
   import countries from '$lib/countryCodes.json'
   import dialCodes from '$lib/dialCodes.json'
	import PhoneInput from '$lib/formComponents/PhoneInput.svelte';
	import FormSubmitWithProgress from '$lib/formComponents/FormSubmitWithProgress.svelte';
	import EmailInput from '$lib/formComponents/EmailInput.svelte';

   interface Props {
      data: SuperValidated<Infer<PropertySubjectToLienSchema>>;
      leaseId: string;
      userId?: string;
      addressId?: string;
      redirectTo?: string; 
      classes?: string;
   }
   let { data, leaseId, userId, addressId, redirectTo, classes}:Props = $props();
   let { form, errors, constraints, enhance, delayed, timeout } = superForm(data)
</script>

<div class={classes}>
   <form action="/forms/propertySubjectToLienForm?leaseId={leaseId}&userId={userId}&addressId={addressId}&redirectTo={redirectTo}" method="POST">  
      <TextArea
         value={$form.description}
         label='Property description'
         name='description'
         errors={$errors.description}
         constraints={$constraints.description}
      />
      <div>
         <TextInput
            value={$form.organizationName}
            label='Organization name'
            name='organizationName'
            errors={$errors.organizationName}
            constraints={$constraints.organizationName}
         />
         <TextInput
            value={$form.givenName}
            label='Contact given name'
            name='givenName'
            errors={$errors.givenName}
            constraints={$constraints.givenName}
         />
         <TextInput
            value={$form.familyName}
            label='Contact family name'
            name='familyName'
            errors={$errors.familyName}
            constraints={$constraints.familyName}
         />
         <EmailInput
            value={$form.email}
            label='Email'
            name='email'
            errors={$errors.email}
            constraints={$constraints.email}
            placeholder='info@email.com'
         />
      </div>
      <div>
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
         <input type="hidden" value={leaseId} name='leaseId'/>
         <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} />
      </div>
   </form>
</div>