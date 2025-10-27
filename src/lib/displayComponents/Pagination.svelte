<script lang='ts'>
   import { Pagination } from "@skeletonlabs/skeleton-svelte";
   import IconArrowLeft from 'lucide-svelte/icons/arrow-left';
   import IconArrowRight from 'lucide-svelte/icons/arrow-right';
   import IconEllipsis from 'lucide-svelte/icons/ellipsis';
   import { Combobox, Portal, useListCollection } from "@skeletonlabs/skeleton-svelte";
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
   let comboboxData = [
      {label: `Show 5 ${label}`, value: '5' },
      {label: `Show 10 ${label}`, value: '10'},
      {label: `Show 25 ${label}`, value: '25'},
      {label: `Show 50 ${label}`, value: '50'},
      {label: `Show all ${array.length} ${label}`, value: 'all'},
   ]
   let items = $state(comboboxData);
   const onOpenChange = () => {
      items = comboboxData
   }
   const collection = $derived(useListCollection({
      items: items,
      itemToString: (item) => item.label,
      itemToValue: (item) => item.value,
      isItemDisabled: (item) => item.value === size.toString()
   }))
</script>

<div class="flex flex-col sm:flex-row m-2 gap-1 {classes} max-w-screen">
   <Combobox {collection} {onOpenChange} onValueChange={(e) => {
      size=parseInt(e.value[0], 10);
   }}>
      <Combobox.Label>Select page size</Combobox.Label>
      <Combobox.Control>
         <Combobox.Input />
         <Combobox.Trigger />
      </Combobox.Control>
      <Portal>
         <Combobox.Positioner class='z-1!'>
            <Combobox.Content>
               {#each items as item}
                  <Combobox.Item {item}>
                     <Combobox.ItemText class='truncate'>{item.label}</Combobox.ItemText>
                     <Combobox.ItemIndicator />
                  </Combobox.Item>
               {/each}
            </Combobox.Content>
         </Combobox.Positioner>
      </Portal>
   </Combobox>
   <Pagination count={array.length} pageSize={size} page={pageNum} onPageChange={(e) => (pageNum = e.page)} siblingCount={0} >
      <Pagination.PrevTrigger>
         <IconArrowLeft />
      </Pagination.PrevTrigger>
      <Pagination.Context>
         {#snippet children(pagination)}
            {#each pagination().pages as page, index (page)}
               {#if page.type === 'page'}
                  <Pagination.Item {...page}>
                     {page.value}
                  </Pagination.Item>
               {:else}
                  <Pagination.Ellipsis {index}><IconEllipsis /></Pagination.Ellipsis>
               {/if}
            {/each}
         {/snippet}
      </Pagination.Context>
      <Pagination.NextTrigger>
         <IconArrowRight />
      </Pagination.NextTrigger>
   </Pagination>
</div>