<!-- <script lang="ts">
	import { PUBLIC_RADAR_TEST } from "$env/static/public";
   import Radar from "radar-sdk-js";
	import { onMount } from "svelte";
   onMount(()=>{
      Radar.initialize(PUBLIC_RADAR_TEST)
      Radar.ui.autocomplete({
         container: 'autocomplete',
         responsive: true, 
         width: '600',
         layers: ['address'],
         countryCode: 'US, CA', 
         onError(error) {
            console.log(error)
         },
      })

   })
</script>
<div id='autocomplete' class="input rounded-lg w-[600px]"></div> -->