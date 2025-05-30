<svelte:head>
   <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
   <script src="https://api.demo.convergepay.com/hosted-payments/Checkout.js"></script>
</svelte:head>
<script lang="ts">
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
   import { creditCardFormSchema, type CreditCardFormSchema } from "$lib/formSchemas/schemas";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import TextInput from "$lib/formComponents/TextInput.svelte";
	import { browser } from '$app/environment';;
	import { goto } from '$app/navigation';
	import { Combobox } from "@skeletonlabs/skeleton-svelte";
	import { valibot, } from "sveltekit-superforms/adapters";
	import type { Invoice } from "@prisma/client";
   import Payment from "payment";
	import { onMount } from "svelte";
	import ArrowUp_0_1 from "lucide-svelte/icons/arrow-up-0-1";

   interface Props {
      data: SuperValidated<Infer<CreditCardFormSchema>>,
      sessionToken: string,
      invoice: Invoice,
      subscription: boolean,
      classes?: string,
      buttonText?: string
   }
   let { data, sessionToken, invoice, subscription, buttonText='Pay Bill',classes, }:Props = $props();
   let processing = $state(false)
   let { form, message, errors, constraints, enhance, delayed, timeout} = superForm(data, {
      SPA: true,
      validators: valibot(creditCardFormSchema),
      onUpdate({form}){
         processing = true
         console.log({form})
         if(form.valid){
            const {data} = form;
            let date:string = data.exp.substring(0, data.exp.indexOf(' ')) + data.exp.substring(data.exp.lastIndexOf(' ')+1);
            console.log(date)
            const paymentData = {
               ssl_txn_auth_token: sessionToken, 
               ssl_card_number: data.ccNum,
               ssl_exp_date: date,
               ssl_cvv2cvc2: data.cvv,
               ssl_cvv2cvc2_indicator: 1,
               ssl_amount: invoice.invoiceAmount,
               ssl_avs_zip: data.postalCode,
               ssl_partial_auth_indicator: 0,
               ssl_first_name: data.billingGivenName,
               ssl_last_name: data.billingFamilyName
            }
            const callback = {
               //@ts-ignore
               onError: function (error) { 
                  console.log(error)
               }, 
               //@ts-ignore
               onCancelled: function (response) { 
                  console.log(response)
               
               },
               //@ts-ignore
               onDeclined: function (response) { 
                  console.log(response)
               }, 
               //@ts-ignore
               onApproval: async function (response) { 
               
                  const res = await fetch(`/api/elavon/paymentSuccess?subscription${subscription}`, {
                     method: 'POST',
                     body: JSON.stringify(response, null, '\t')
                  }).then(async (r) => await r.json())
                  console.log(res)
                  if(res){
                     if(browser){
                        goto(`/thanks?invoiceNum=${res}`)
                     }
                  }
               }
            }
         //@ts-ignore
         ConvergeEmbeddedPayment.pay(paymentData, callback)
         }
      }
   });
   let ccNumElement = $state<HTMLInputElement>();
   let ccExpElement = $state<HTMLInputElement>();
   onMount(()=>{
      if(ccNumElement){
         Payment.formatCardNumber(ccNumElement)
      }
      if(ccExpElement){
         Payment.formatCardExpiry(ccExpElement);
      }
   })
</script>
<FormMessage message={$message} />
<form method="POST" use:enhance>
   <div class='{classes}'> 
      <TextInput
         bind:value={$form.billingGivenName}
         errors={$errors.billingGivenName}
         constraints={$constraints.billingGivenName}
         label='Given name on credit card'
         name='billingGivenName'
         placeholder='Smokey'
         autocomplete='cc-given-name'
      />
      <TextInput
         bind:value={$form.billingFamilyName}
         errors={$errors.billingFamilyName}
         constraints={$constraints.billingFamilyName}
         label='Family name on credit card'
         name='billingFamilyName'
         placeholder='Bear'
         autocomplete='cc-family-name'
      />
      <div>
         <label for="ccNum" class="label-text">Credit card number
            <input 
               name="ccNum" 
               id="ccNum" 
               bind:this={ccNumElement} 
               class="input" 
               bind:value={$form.ccNum} 
               autocomplete="cc-number"
               {...$constraints.ccNum}
               />
         </label>
         {#if $errors.ccNum}
            <span class="invalid">{$errors.ccNum}</span>
         {/if}
      </div>
      <div class="flex gap-2 flex-row">
         <div>
            <label for="ccExp" class="label-text">Expiration
               <input
                  name="ccExp"
                  id="ccExp"
                  class="input"
                  bind:this={ccExpElement}
                  autocomplete="cc-exp"
                  bind:value={$form.exp}
               />
            </label>
            {#if $errors.exp}
               <span class="invalid">{$errors.exp}</span>
            {/if}
         </div>
         <TextInput
            bind:value={$form.cvv}
            errors={$errors.cvv}
            constraints={$constraints.cvv}
            label='CVV'
            name='cvv'
            placeholder='123'
            autocomplete='cc-csc'
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
   {#if !processing}
      <button class="btn rounded-lg preset-filled-primary-50-950 m-1 sm:m-2">{buttonText}</button>
   {:else}
      Processing
   {/if}
</form>