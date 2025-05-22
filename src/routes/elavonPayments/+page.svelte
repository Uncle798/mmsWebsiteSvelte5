<svelte:head>
   <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
   <script src="https://demo.convergepay.com/hosted-payments/PayWithConverge.js" ></script>
   <script src="https://api.demo.convergepay.com/hosted-payments/Checkout.js"></script>
</svelte:head>
<script lang="ts">
	import { onMount } from 'svelte';
   import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();
   let sessionToken = $state('');
   let mounted = $state(false);
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
      const paymentData = {
         ssl_txn_auth_token: sessionToken,
         ssl_card_number: (document.getElementById('card') as HTMLInputElement).value,
         ssl_exp_date: (document.getElementById('exp') as HTMLInputElement).value,
         ssl_cvv2cvc2: (document.getElementById('cvv') as HTMLInputElement).value,
         ssl_avs_address: (document.getElementById(''))
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
</script>

<div class="mt-10 flex flex-col">
   
   <button onclick={openLightbox} class="btn">Proceed to Payment</button>
   Transaction Status:<div id="txn_status"></div>
   Transaction Response:<div id="txn_response"></div>
</div>

<div class="m-2">
   <label for="ssl_first_name">Given Name:
      <input type="text" name="ssl_first_name" id="ssl_first_name" class="input">
   </label>
   <label for="ssl_first_name">Family Name:
      <input type="text" name="ssl_first_name" id="ssl_last_name" class="input">
   </label>
   <div class="input input-group">
      <label for=""></label>
   </div>
</div>