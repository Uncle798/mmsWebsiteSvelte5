<script lang="ts">

    interface Props {
        numCols: number;
        numRows: number;
        heightClass: string
    }
    let {
        numCols,
        numRows,
        heightClass
    }:Props = $props()
</script>

<div class="w-full space-y-4">
   <div class="space-y-4">
       <div class="grid grid-cols-{numCols.toString()} gap-x-1 gap-y-3 p-3">
        {#each {length:numRows*numCols} as row }
            <div class="placeholder rounded-2xl animate-pulse {heightClass}"></div>
        {/each}
       </div>
   </div>
</div>