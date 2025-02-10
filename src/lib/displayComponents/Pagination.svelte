<script lang='ts'>
   import { Pagination } from "@skeletonlabs/skeleton-svelte";
   interface Props {
      pageNum: number;
      size: number;
      array: unknown[];
      label: string;
   }
   let {
      pageNum = $bindable(1),
      size = $bindable(25),
      array = $bindable(),
      label
   }:Props = $props()
   let slicedSource = $derived((source:[]) => source.slice((pageNum-1)*size, pageNum*size));
</script>

<footer class="flex w-full m-2">
   {#if array.length > size}  
      <select name="size" id="size" class="select w-1/2" bind:value={size}>
         {#each [5,10,25,50] as v}
         <option value={v}>Show {v} {label} per page</option>
         {/each}
         <option value={array.length}>Show all {array.length} {label}</option>
      </select>
   {/if}
   <Pagination data={array} bind:page={pageNum} bind:pageSize={size} classes=''/>
</footer>