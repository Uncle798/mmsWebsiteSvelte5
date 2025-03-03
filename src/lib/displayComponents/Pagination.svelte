<script lang='ts'>
   import { Pagination } from "@skeletonlabs/skeleton-svelte";
   import IconArrowLeft from 'lucide-svelte/icons/arrow-left';
   import IconArrowRight from 'lucide-svelte/icons/arrow-right';
   import IconEllipsis from 'lucide-svelte/icons/ellipsis';
   import IconFirst from 'lucide-svelte/icons/chevrons-left';
   import IconLast from 'lucide-svelte/icons/chevron-right';
   interface Props {
      pageNum: number;
      size: number;
      array: unknown[];
      label: string;
      classes?: string;
   }
   let {
      pageNum = $bindable(1),
      size = $bindable(25),
      array = $bindable(),
      label,
      classes
   }:Props = $props()
   let slicedSource = $derived((source:[]) => source.slice((pageNum-1)*size, pageNum*size));
</script>

<div class="flex flex-col sm:flex-row m-2 gap-1 {classes}">
   {#if array.length > size}  
      <select name="size" id="size" class="select rounded-lg truncate sm:w-1/2" bind:value={size}>
         {#each [5,10,25,50] as v}
         <option value={v}>Show {v} {label} per page</option>
         {/each}
         <option value={array.length}>Show all {array.length} {label}</option>
      </select>
   {/if}
   <Pagination data={array} bind:page={pageNum} bind:pageSize={size} classes='rounded-lg' showFirstLastButtons={true} siblingCount={3}>
      {#snippet labelEllipsis()}<IconEllipsis class="size-4" />{/snippet}
      {#snippet labelNext()}<IconArrowRight class="size-4" />{/snippet}
      {#snippet labelPrevious()}<IconArrowLeft class="size-4" />{/snippet}
      {#snippet labelFirst()}<IconFirst class="size-4" />{/snippet}
      {#snippet labelLast()}<IconLast class="size-4" />{/snippet}
   </Pagination>
</div>