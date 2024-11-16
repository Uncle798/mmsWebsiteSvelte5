<script lang='ts'>
   import { Progress, ProgressRing } from "@skeletonlabs/skeleton-svelte";
   interface Props {
      delayed: boolean,
      timeout: boolean,
   }
   let { delayed = $bindable(), timeout=$bindable() }:Props = $props();
</script>

{#if delayed && !timeout}
   <ProgressRing value={null} size="size-8" strokeWidth="6px" meterStroke="stroke-secondary-600-400" trackStroke="stroke-secondary-50-950" />
{/if}
{#if timeout}
   <Progress value={null} width="size-8" />
{/if}