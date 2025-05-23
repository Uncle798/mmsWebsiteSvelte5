<script lang="ts">
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
   import type { CreditCardFormSchema } from "$lib/formSchemas/schemas";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import TextInput from "$lib/formComponents/TextInput.svelte";
	import NumberInput from "$lib/formComponents/NumberInput.svelte";
	import { onMount } from "svelte";
	import { Combobox } from "@skeletonlabs/skeleton-svelte";
	import { IndentDecrease } from "lucide-svelte";

   interface Props {
      data: SuperValidated<Infer<CreditCardFormSchema>>,
      classes?: string
   }
   let { data, classes, }:Props = $props();
   let { form, message, errors, constraints, enhance, delayed, timeout} = superForm(data, {});

   interface ComboboxData {
      label: string;
      value: string;
   }
   const monthComboBoxData:ComboboxData[] = []
   for (let index = 1; index < 13; index++){
      if(index < 10){
         const string = '0'+ index.toString()
         monthComboBoxData.push({ label: string, value:string})
      } else {
         monthComboBoxData.push({label: index.toString(), value: index.toString()})
      }
   }
   const yearComboBoxData: ComboboxData[] = [];
   for(let index = new Date().getFullYear(); index < (new Date().getFullYear() +20); index++){
      const string = index.toString().substring(2);
      yearComboBoxData.push({
         label: index.toString(),
         value: string
      })
   }
   const thisMonth = (new Date().getMonth()+1)
   let thisMonthLabel = $state('')
   if(thisMonth < 10){
      thisMonthLabel = '0' + thisMonth.toString()
   } else {
      thisMonthLabel = thisMonth.toString();
   }
</script>

<div class={classes}>
   <TextInput 
      errors={$errors.ccNum}
      constraints={$constraints.ccNum}
      bind:value={$form.ccNum}
      label='Credit Card Number'
      name='ccNum'
      placeholder='0000 0000 0000 0000'
      autocomplete='cc-number'
   />
   <div class="input-group flex gap-4 ">
      <label for="expMonth">Expiration month
         <select name="expMonth" id="expMonth" class="select m-2" value={$form.expMonth}>
            {#each monthComboBoxData as month}
               {#if month.label === thisMonthLabel}
                  <option value={month.value} selected>{month.label}</option>
               {:else}
                  <option value={month.value}>{month.label}</option>
               {/if}
            {/each}
         </select>
      </label>
      <label for="expYear">Expiration year
         <select name="expYear" id="expYear" class="select m-2" value={$form.expYear}>
            {#each yearComboBoxData as year}
               {#if year.label === new Date().getFullYear().toString()}
                  <option value={year.value} selected>{year.label}</option>
               {:else}
                  <option value={year.value}>{year.label}</option>
               {/if}
            {/each}
         </select>
      </label>
      <NumberInput
         bind:value={$form.cvv}
         errors={$errors.cvv}
         constraints={$constraints.cvv}
         label='CVV'
         name='cvv'
         placeholder='123'
         autocomplete='cc-csc'
         classes='p-1'
      />
      <TextInput
         bind:value={$form.postalCode}
         errors={$errors.postalCode}
         constraints={$constraints.postalCode}
         label='Billing zip code'
         name='postalCode'
         placeholder='83843'
         autocomplete='billing postal-code'
      />
   </div>
</div>