<script lang='ts'>
	import type { AlternativeContactFormSchema } from "$lib/formSchemas/alternativeContactFormSchema";
   import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
   import TextInput from "$lib/formComponents/TextInput.svelte";
   import countries from '$lib/countryCodes.json'
   import dialCodes from '$lib/dialCodes.json'
	import PhoneInput from '$lib/formComponents/PhoneInput.svelte';
	import EmailInput from "$lib/formComponents/EmailInput.svelte";

   interface Props {
      data: SuperValidated<Infer<AlternativeContactFormSchema>>;
      leaseId: string;
      addressId?: string;
      redirectTo?: string;
      userId?: string;
      classes?: string;
   }
   let { data, leaseId, addressId, redirectTo, userId, classes }:Props = $props();
   let { form, message, errors, constraints, enhance, delayed, timeout } = superForm(data, {
      onSubmit({formData}) {
         if($form.phoneNum1){
            formData.set('phoneNum1', $form.phoneNum1.replace(/\D/g, ''));
         }
      },
   })
</script>

<div class={classes}>
   <FormMessage message={$message} />
   <form action="/forms/alternativeContactForm?leaseId={leaseId}&addressId={addressId}&redirectTo={redirectTo}&userId={userId}" method="POST" use:enhance>
      <div class="flex flex-col sm:flex-row gap-2">
         <TextInput
            bind:value={$form.givenName}
            errors={$errors.givenName}
            constraints={$constraints.givenName}
            label='Contact given name'
            name='givenName'
            placeholder='Smokey'
            classes=''
         />
         <TextInput
            bind:value={$form.familyName}
            errors={$errors.familyName}
            constraints={$constraints.familyName}
            label='Contact family name'
            name='familyName'
            placeholder='Bear'
         />
         <EmailInput
            bind:value={$form.email}
            errors={$errors.email}
            constraints={$constraints.email}
            label='Email'
            name='email'
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
         />
         <TextInput
            bind:value={$form.address2}
            errors={$errors.address2}
            constraints={$constraints.address2}
            name='address2'
            label='Line 2'
            placeholder='Unit 1'  
         />
         <div class="flex flex-col sm:flex-row gap-x-2">
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
            name='postalCode'
            bind:value={$form.postalCode}
            errors={$errors.postalCode}
            constraints={$constraints.postalCode}
            placeholder='83843'
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
      </div>
      <input type="hidden" value={leaseId} name="leaseId"/>
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} />
   </form>
</div>