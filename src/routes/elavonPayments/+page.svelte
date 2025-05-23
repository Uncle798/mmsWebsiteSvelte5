<svelte:head>
   <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
   <script src="https://demo.convergepay.com/hosted-payments/PayWithConverge.js" ></script>
   <script src="https://api.demo.convergepay.com/hosted-payments/Checkout.js"></script>
</svelte:head>
<script lang="ts">
	import { onMount } from 'svelte';
   import type { PageData } from './$types';
	import CreditCardForm from '$lib/forms/CreditCardForm.svelte';
	import AddressForm from '$lib/forms/AddressForm.svelte';
	import { redirect } from '@sveltejs/kit';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

   let { data }: { data: PageData } = $props();
   let sessionToken = $state('');
   let mounted = $state(false);
   let processing = $state(false)
   onMount(async () => {
      sessionToken = await getSessionToken();
      setTimeout(() => {
         location.reload();
      }, 15*60*1000)
      mounted = true
   })

   async function getSessionToken() {
      const response = await fetch('/api/elavon/', {
         method: 'POST',
         headers: {
            'content-type':'applications/json'
         },
         body: JSON.stringify({
            invoiceNum: data.invoice.invoiceNum,
            subscription: data.subscription,
            newLease: data.newLease, 
            leaseId: data.leaseId
         })
      })
      const body = await response.json();
      return body
   }
   async function openLightbox() {
      const callback = {
         //@ts-ignore
         onError: function (error) { 
            showResult("error", error); 
         }, 
         onCancelled: function () { 
            showResult("cancelled", ""); 
         },
         //@ts-ignore
         onDeclined: function (response) { 
            showResult("declined", JSON.stringify(response, null, '\t')); 
         }, 
         //@ts-ignore
         onApproval: function (response) { 
            showResult("approval", JSON.stringify(response, null, '\t'));
            const res = fetch('/api/elavon/paymentSuccess', {
               body: JSON.stringify(response, null, '\t')
            }).then(async (r) => await r.json())

         }
      }
      //@ts-ignore
      PayWithConverge.open({ssl_txn_auth_token: sessionToken}, callback)
   }
   async function pay() {
      processing = true;
      const date = (document.getElementById('expMonth') as HTMLInputElement).value + (document.getElementById('expYear') as HTMLInputElement).value
      const paymentData = {
         ssl_txn_auth_token: sessionToken,
         ssl_card_number: (document.getElementById('ccNum') as HTMLInputElement).value,
         ssl_exp_date: date,
         ssl_cvv2cvc2: (document.getElementById('cvv') as HTMLInputElement).value,
         ssl_cvv2cvc2_indicator:1,
         ssl_amount: data.invoice.invoiceAmount,
         ssl_avs_zip: (document.getElementById('postalCode') as HTMLInputElement).value,
         ssl_partial_auth_indicator: 0,

      }
      if(paymentData){
         const callback = {
            //@ts-ignore
            onError: function (error) { 
               showResult("error", error); 
            }, 
            onCancelled: function () { 
               showResult("cancelled", ""); 
            },
            //@ts-ignore
            onDeclined: function (response) { 
               showResult("declined", JSON.stringify(response, null, '\t')); 
            }, 
            //@ts-ignore
            onApproval: async function (response) { 
               showResult("approval", JSON.stringify(response, null, '\t'));
               const res = await fetch('/api/elavon/paymentSuccess', {
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
   function showResult(status:string, msg:string){
      const statusHTML = document.getElementById('txn_status')
      if(statusHTML){
         statusHTML.innerHTML = status
      }
      const responseHTML = document.getElementById('txn_response')
      if(responseHTML){
         responseHTML.innerHTML = msg
      }
   }
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

<div class="mt-10 flex flex-col">
   
   <button onclick={openLightbox} class="btn">Proceed to Payment</button>
   Transaction Status:<div id="txn_status"></div>
   Transaction Response:<div id="txn_response"></div>
</div>

<div class="m-2">
   <label for="ccNum">Credit Card number
      <input type="text" name="ccNum" id="ccNum" class="input" placeholder="0000 0000 0000 0000" autocomplete="cc-number">
   </label>
   <div class="input-group flex gap-4 ">
      <label for="expMonth">Expiration month
         <select name="expMonth" id="expMonth" class="select m-2">
            {#each monthComboBoxData as month}
               {#if month.label === thisMonthLabel}
                  <option value={month.value} selected>{month.label}</option>
               {:else}
                  <option value={month.value}>{month.label}</option>
               {/if}
            {/each}
         </select>
      </label>
      <div class="px-2">
         <label for="expYear">Expiration year
            <select name="expYear" id="expYear" class="select m-2">
               {#each yearComboBoxData as year}
               {#if year.label === new Date().getFullYear().toString()}
               <option value={year.value} selected>{year.label}</option>
               {:else}
               <option value={year.value}>{year.label}</option>
               {/if}
               {/each}
            </select>
         </label>
      </div>
      <div class="px-2">
         <label for="cvv">CVV
            <input type="text" name="cvv" id="cvv" class="input my-2" placeholder="000" autocomplete="cc-csc" />
         </label>
      </div>
      <div class="px-2">
         <label for="postalCode">Billing zip code
            <input type="text" name="postalCode" id="postalCode" class="input my-2" placeholder="83843" autocomplete="billing postal-code">
         </label>
      </div>
   </div>
   {#if !processing}
      <button onclick={pay} class="btn">Pay bill</button>
   {:else}
      Processing
   {/if}
</div>
