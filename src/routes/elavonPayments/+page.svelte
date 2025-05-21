<svelte:head>
   <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
   <script src="https://demo.convergepay.com/hosted-payments/PayWithConverge.js"></script>
</svelte:head>
<script lang="ts">
	import { onMount } from 'svelte';
   import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();
   let sessionToken = $state('');
   let payWithConverge = $state();
   let mounted = $state(false);
   onMount(() => {
       
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
      console.log(body);
      return body
   }
   function openLightbox() {
      const callback = {
         onError: function (error:string){
            showResult('error', error)
         }
      }
      PayWithConverge.open
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


<form name="getSessionTokenForm">
      <br><br><br><br>      
      First Name: <input type="text" id="name" name="ssl_first_name" size="25" value="John"> <br><br>
      Last Name: <input type="text" id="lastname" name="ssl_last_name" size="25" value="Smith"> <br>
      Transaction Amount: <input type="text" id="ssl_amount" name="ssl_amount" value="100.00"> <br> <br>
      <button onclick={getSessionToken}>Click to Confirm Order</button> <br>
    </form>
    <br><br>
    Transaction Token: <input id="token" type="text" name="token"> <br />
    <button onclick={openLightbox}>Proceed to Payment</button> <br>
  
    <br><br><br><br>
    Transaction Status:<div id="txn_status"></div>
    <br>
    Transaction Response:<div id="txn_response"></div>