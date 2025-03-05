<script lang="ts">

    interface Props {
        numCols: number;
        numRows: number;
        heightClass: string;
        classes?: string;
    }
    let {
        numCols = 1,
        numRows = 1,
        heightClass = 'h-10',
        classes = '',
    }:Props = $props()
</script>

<div class="{classes}">
    <div class="grid grid-cols-{numCols.toString()} gap-x-1 gap-y-3 p-3">
        {#each {length:numRows*numCols} as row }
            <div class="placeholder rounded-2xl animate-pulse {heightClass}"></div>
        {/each}
    </div>
</div>