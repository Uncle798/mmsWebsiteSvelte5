<script lang='ts'>
   import { Progress, ProgressRing } from "@skeletonlabs/skeleton-svelte";
   interface Props {
      delayed: boolean,
      timeout: boolean,
      buttonText?: string,
   }
   let { delayed = $bindable(), timeout=$bindable(), buttonText=$bindable('Submit') }:Props = $props();
</script>
<div class="flex">
   <button class="btn bg-primary-950 p-4 rounded-lg hover:bg-primary-900 transition hover:text-white">{buttonText}</button>
   {#if delayed && !timeout}
      <ProgressRing value={null} size="size-8" strokeWidth="6px" meterStroke="stroke-secondary-600-400" trackStroke="stroke-secondary-50-950" />
   {/if}
   {#if timeout}
      <Progress value={null} width="size-8" classes='mt-1'/>
   {/if}
</div>