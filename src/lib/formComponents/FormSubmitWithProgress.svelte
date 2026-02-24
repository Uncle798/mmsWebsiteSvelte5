<script lang='ts'>
   import Button from "$lib/core/Button.svelte";
import ProgressLine from "$lib/displayComponents/ProgressLine.svelte";
   import ProgressRing from "$lib/displayComponents/ProgressRing.svelte";
	import { Progress } from "@skeletonlabs/skeleton-svelte";
	import { fade } from "svelte/transition";
   interface Props {
      delayed: boolean,
      timeout: boolean,
      buttonText?: string,
      classes?: string,
   }
   let { delayed = $bindable(), timeout=$bindable(), buttonText=$bindable('Submit'), classes }:Props = $props();
</script>
<div class="flex {classes}">
   <Button
      label={buttonText}
      type='submit'
      classes=''
   />
   {#if !delayed && !timeout}
      <div class="w-8 h-8"></div>
   {/if}
   {#if delayed && !timeout}
      <div transition:fade={{duration:600}}>
         <ProgressRing value={null} classes='mx-2'/>
      </div>
   {/if}
   {#if timeout}         
      <div transition:fade={{duration:600}}>
         <ProgressLine value={null} classes='mx-2' />
      </div>
   {/if}
</div>