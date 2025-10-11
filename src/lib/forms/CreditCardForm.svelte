<svelte:head>
   <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
   <script src="https://api.demo.convergepay.com/hosted-payments/Checkout.js"></script>
</svelte:head>
<script lang="ts">
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
   import { creditCardFormSchema, type CreditCardFormSchema } from "$lib/formSchemas/schemas";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import { browser } from '$app/environment';;
	import { goto } from '$app/navigation';
   import { fade } from "svelte/transition";
	import { Tooltip, } from "@skeletonlabs/skeleton-svelte";
	import { valibot, } from "sveltekit-superforms/adapters";
	import type { Invoice } from "@prisma/client";
   import Payment from "payment";
	import { onMount } from "svelte";
	import { Info } from "lucide-svelte";
	import ExplainerModal from "$lib/displayComponents/Modals/ExplainerModal.svelte";
	import ProgressRing from "$lib/displayComponents/ProgressRing.svelte";
	import ProgressLine from "$lib/displayComponents/ProgressLine.svelte";

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
   let { form, message, errors, constraints, enhance, delayed, timeout, } = superForm(data, {
      SPA: true,
      validators: valibot(creditCardFormSchema),
      onUpdate({form}){
         processing = true
         if(form.valid){
            const {data} = form;
            let date:string = data.exp.substring(0, data.exp.indexOf(' ')) + data.exp.substring(data.exp.lastIndexOf(' ')+1);
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
   let zipcodeToolTipOpen = $state(false);
   let explainerModalOpen = $state(true);
   let familyNameToolTipOpen = $state(false);
   let givenNameTooltipOpen = $state(false);
   onMount(()=>{
      setTimeout(()=>{
         explainerModalOpen=false
      }, 4000)
   })
</script>
<FormMessage message={$message} />
<ExplainerModal
   modalOpen={explainerModalOpen}
>
   {#snippet content()}
      Please chose Cash or Check as there is currently no way of demoing credit card payments
   {/snippet}
</ExplainerModal>
<form method="POST" use:enhance>
   <div class='{classes}'> 
      <div>        
         <label for="billingGivenName" class="label-text">Give name on credit card
            <Tooltip  open={givenNameTooltipOpen}>
               <Tooltip.Trigger>
                     <Info aria-label='Given name number tool tip' size={15} />
               </Tooltip.Trigger>
               <Tooltip.Content class='card bg-surface-300-700 p-2'>
                  Please use any name
               </Tooltip.Content>
            </Tooltip>
            <input 
               name="billingGivenName" 
               id="billingGivenName" 
               type="text"
               class="input"
               placeholder="Smokey" 
               bind:value={$form.billingGivenName} 
               autocomplete="cc-given-name"
               {...$constraints.billingGivenName}
            />
         </label>
         {#if $errors.billingFamilyName}
         <span class="invalid">{$errors.billingFamilyName}</span>
         {/if}
      </div>
      <div>        
         <label for="billingFamilyName" class="label-text">Family name on credit card
            <Tooltip open={familyNameToolTipOpen}>
               <Tooltip.Trigger>
                  <Info aria-label='Family name number tool tip' size={15} />
               </Tooltip.Trigger>
               <Tooltip.Content class='card bg-surface-300-700 p-2'>
                  Please use any name
               </Tooltip.Content>
            </Tooltip>
            <input 
            name="billingFamilyName" 
            id="billingFamilyName" 
            type="text"
            class="input"
            placeholder="Bear" 
            bind:value={$form.billingFamilyName} 
            autocomplete="cc-family-name"
            {...$constraints.billingFamilyName}
            />
         </label>
         {#if $errors.billingFamilyName}
         <span class="invalid">{$errors.billingFamilyName}</span>
         {/if}
      </div>
      <div>        
         <label for="ccNum" class="label-text">Credit card number
            <Tooltip open={ccToolTipOpen}>
               <Tooltip.Trigger>
                  <Info aria-label='Credit card number tool tip' size={15} />
               </Tooltip.Trigger>
               <Tooltip.Content class='card bg-surface-300-700 p-2'>
                  Please use 4000000000000002 or any of the card numbers from <a href="https://developer.elavon.com/test-cards" class="anchor">https://developer.elavon.com/test-cards</a>
               </Tooltip.Content>
            </Tooltip>
            <input 
            name="ccNum" 
            id="ccNum" 
            bind:this={ccNumElement} 
            class="input" 
            placeholder="4000 0000 0000 0002"
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
               <Tooltip open={expToolTipOpen}>
                  <Tooltip.Trigger>
                     <Info aria-label='Credit card expiration tool tip' size={15}/>
                  </Tooltip.Trigger>
                  <Tooltip.Content class='card bg-surface-300-700 p-2'>
                     Please use a future date, from <a href="https://developer.elavon.com/test-cards" class="anchor">https://developer.elavon.com/test-cards</a>
                  </Tooltip.Content>
               </Tooltip>
               <input
                  name="ccExp"
                  id="ccExp"
                  class="input"
                  bind:this={ccExpElement}
                  autocomplete="cc-exp"
                  bind:value={$form.exp}
                  {...$constraints.exp}
                  placeholder="12/29"
               />
            </label>
            {#if $errors.exp}
               <span class="invalid">{$errors.exp}</span>
            {/if}
         </div>
         <div>               
            <label for="cvv" class="label-text">CVV code
               <Tooltip open={cvvToolTipOpen}>
                  <Tooltip.Trigger>
                     <Info aria-label='CVV code tool tip' size={15}/>
                  </Tooltip.Trigger>
                  <Tooltip.Content class='card bg-surface-300-700 p-2'>
                     Please use any valid cvv code, from <a href="https://developer.elavon.com/test-cards" class="anchor">https://developer.elavon.com/test-cards</a>
                  </Tooltip.Content>
               </Tooltip>
               <input
                  name="cvv"
                  id="cvv"
                  class="input"
                  type="text"
                  autocomplete="cc-csc"
                  bind:value={$form.cvv}
                  {...$constraints.cvv}
                  placeholder="123"
               />
            </label>
            {#if $errors.cvv}
               <span class="invalid">{$errors.cvv}</span>
            {/if}
         </div>
         <div>
            <label for="postalCode" class="label-text">Postal code
               <Tooltip open={zipcodeToolTipOpen}>
                  <Tooltip.Trigger>
                     <Info aria-label='Postal code tool tip' size={15}/>
                  </Tooltip.Trigger>
                  <Tooltip.Content class='card bg-surface-300-700 p-2'>
                     Please use any valid postal code.
                  </Tooltip.Content>
               </Tooltip>
               <input
                  name="postalCode"
                  id="postalCode"
                  class="input"
                  type="text"
                  autocomplete="postal-code"
                  bind:value={$form.postalCode}
                  {...$constraints.postalCode}
                  placeholder="12345"
               />
            </label>
            {#if $errors.postalCode}
               <span class="invalid">{$errors.postalCode}</span>
            {/if}
         </div>
      </div>
   </div>  
   {#if !processing}
      <button class="btn rounded-lg preset-filled-primary-50-950 my-1 sm:my-2">{buttonText}</button>
   {:else if processing}
      Processing...
      {#if !delayed && !timeout}
         <div class="w-8 h-8"></div>
      {/if}
      {#if delayed && !timeout}
      <div transition:fade={{duration:600}}>
         <ProgressRing value={null} />
      </div>
      {/if}
      {#if timeout}
      <div transition:fade={{duration:600}}>
         <ProgressLine value={null} />
      </div>
      {/if}
   {/if}
   <div bind:this={errorDisplay}></div>
</form>