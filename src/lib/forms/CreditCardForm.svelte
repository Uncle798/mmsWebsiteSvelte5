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
   import { fade } from "svelte/transition";
	import { ProgressRing, Progress, Tooltip } from "@skeletonlabs/skeleton-svelte";
	import { valibot, } from "sveltekit-superforms/adapters";
	import type { Invoice } from "@prisma/client";
   import Payment from "payment";
	import { onMount } from "svelte";
	import ExplainerModal from "$lib/demo/ExplainerModal.svelte";

   interface Props {
      data: SuperValidated<Infer<CreditCardFormSchema>>,
      sessionToken: string,
      invoice: Invoice,
      subscription: boolean,
      classes?: string,
      buttonText?: string
   }
   let { data, sessionToken, invoice, subscription, buttonText='Pay Bill',classes, }:Props = $props();
   let processing = $state(false);
   let errorDisplay = $state<HTMLElement>();
   let { form, message, errors, constraints, enhance, delayed, timeout} = superForm(data, {
      SPA: true,
      validators: valibot(creditCardFormSchema),
      onUpdate({form}){
         processing = true
         if(form.valid){
            const {data} = form;
            let date:string = data.exp.substring(0, data.exp.indexOf(' ')) + data.exp.substring(data.exp.lastIndexOf(' ')+1);
            const paymentData = {
               ssl_txn_auth_token: sessionToken, 
               ssl_card_number: '4000000000000002',
               ssl_exp_date: '1230',
               ssl_cvv2cvc2: '012',
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
                  if(errorDisplay){
                     errorDisplay.innerHTML = error
                  }
                  processing = false
                  $timeout = false
               }, 
               //@ts-ignore
               onCancelled: function (response) { 
                  processing = false
                  $timeout = false
               
               },
               //@ts-ignore
               onDeclined: function (response) {
                  if(errorDisplay){
                     errorDisplay.innerHTML = response.errorMessage
                  }
                  processing = false
                  $timeout = false
               }, 
               //@ts-ignore
               onApproval: async function (response) { 
               
                  const res = await fetch(`/api/elavon/paymentSuccess`, {
                     method: 'POST',
                     body: JSON.stringify({response, subscription}, null, '\t')
                  }).then(async (r) => await r.json())
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
   let ccToolTipOpen = $state(false);
   let expToolTipOpen = $state(false);
   let cvvToolTipOpen = $state(false);
   let explainerModalOpen = $state(true);
   onMount(()=>{
      setTimeout(()=>{
         explainerModalOpen=false
      }, 5000)
   })
</script>
<FormMessage message={$message} />
<ExplainerModal 
   bind:modalOpen={explainerModalOpen}
   copy="I've hard coded the credit card info to a test card but feel free to fill out the form"
/>
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
         <Tooltip
            open={ccToolTipOpen}
            onOpenChange={(e) => (ccToolTipOpen = e.open)}
            positioning={{placement: 'top-end'}}
            contentBase="card preset-filled p-2"
            openDelay={200}
            zIndex='30'
         >
            {#snippet trigger()}               
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
            {/snippet}
            {#snippet content()}
               I've hard coded a test CC number for this demo
            {/snippet}
         </Tooltip>
      </div>
      <div class="flex gap-2 flex-row">
         <div>
            <Tooltip
            open={expToolTipOpen}
            onOpenChange={(e) => (expToolTipOpen = e.open)}
            positioning={{placement: 'top-end'}}
            contentBase="card preset-filled p-2"
            openDelay={200}
            zIndex='30'
         >
            {#snippet trigger()}               
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
            {/snippet}
            {#snippet content()}
               I've hard coded a test expiration date for this demo.
            {/snippet}
         </Tooltip>

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
      <button class="btn rounded-lg preset-filled-primary-50-950 my-1 sm:my-2">{buttonText}</button>
   {:else if processing}
      Processing...
      {#if $delayed && !$timeout}
         <div in:fade={{duration:600}}>
            <ProgressRing value={null} size="size-8" strokeWidth="6px" meterStroke="stroke-secondary-600-400" trackStroke="stroke-secondary-50-950" classes='ml-2' />
         </div>
      {/if}
      {#if $timeout}
         <div in:fade={{duration:600}}>
            <Progress value={null} width="size-8" classes='mt-2 ml-2' />
         </div>
      {/if}
   {/if}
   <div bind:this={errorDisplay}></div>
</form>