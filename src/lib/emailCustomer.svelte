<script lang="ts">
   interface Props {
      recordNum: number;
      apiEndPoint: string;
      emailAddress: string;
      buttonText: string;
      classes?: string
   }
   let { recordNum, apiEndPoint, emailAddress, buttonText, classes }:Props = $props();
   let emailing = $state(false);
   let emailed = $state(false);
   async function sendEmail(recordNum:number) {
      emailing = true;
      const res = await fetch(apiEndPoint, {
         method: "POST",
         body: JSON.stringify({recordNum})
      })
      const body = await res.json();
      if(body.success){
         emailed = true;
      }
      setTimeout(()=>{
         emailing = false
         emailed = false
      }, 5000)
   }
</script>
<div class={classes}>
   {#if emailed}
      <div class="my-2">An email receipt has been sent to {emailAddress}</div>
   {:else if emailing}
      <div class="m-2">Sending email...</div>
   {:else if !emailing}
      <button class="btn rounded-lg preset-filled-primary-50-950 my-2" onclick={()=>sendEmail(recordNum)}>{buttonText}</button>
   {/if}
</div>