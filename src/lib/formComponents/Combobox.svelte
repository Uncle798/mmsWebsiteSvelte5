<script lang="ts">
   import { Combobox, Portal, useListCollection } from "@skeletonlabs/skeleton-svelte";
   import Fuse from 'fuse.js'
   import type { ComboboxRootProps } from "@skeletonlabs/skeleton-svelte";

   interface Props {
      data: {label:string, value:string}[];
      label: string;
      placeholder?: string;
      name?: string;
      classes?: string;
      onValueChange?: ComboboxRootProps['onValueChange'];
   }
   let { 
      data,
      label,
      name,
      classes,
      placeholder = 'Search...',
      onValueChange = (event) => {
         const filtered = data.filter((item) => item.value.toLowerCase().includes(event.value[0].toLowerCase()));
         if(filtered.length > 0){
            items = filtered;
         }else {
            items = data;
         }
      }
   }:Props = $props();
   let items = $state(data)
   const collection = $derived(useListCollection({
      items: items,
      itemToString: (item) => item.label,
      itemToValue: (item) => item.value,
   }))
   const onOpenChange = () => {
      items = data;
   }
   const fuse = new Fuse(data, {
      keys: ['label', 'value'],
      threshold: 0.3
   })
   const onInputValueChange:ComboboxRootProps['onInputValueChange'] = (event) => {
      const results = fuse.search(event.inputValue);
      if(results.length > 0){
         items = results.map((result) => result.item);
      } else {
         items = data;
      }
   }
</script>
<div class={classes}>
   <Combobox {collection} {onOpenChange} {onValueChange} inputBehavior='autocomplete' {placeholder} {onInputValueChange} openOnClick={true} {name}>
      <Combobox.Label>{label}</Combobox.Label>
      <Combobox.Control>
         <Combobox.Input />
         <Combobox.Trigger />
      </Combobox.Control>
      <Portal>
         <Combobox.Positioner class='z-60!'>
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
</div>