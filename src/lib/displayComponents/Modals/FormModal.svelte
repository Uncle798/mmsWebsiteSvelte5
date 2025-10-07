<script lang='ts'>
   import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
	import { CircleX, } from "lucide-svelte";
	import type { Snippet } from "svelte";
   interface Props {
      modalOpen: boolean;
      content: Snippet;
      title?: string;
   }
   let { modalOpen=$bindable(), content, title }:Props = $props()
</script>

<Dialog open={modalOpen} onOpenChange={(d) => {
   modalOpen = d.open;
}}>
   <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner class='card bg-surface-100-900 p-2 shadow-xl max-w-screen-sm'>
         <Dialog.Content >
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Description>
               <header >
                  <Dialog.CloseTrigger><CircleX class='absolute right-1' /></Dialog.CloseTrigger>
               </header>
               {@render content()}
            </Dialog.Description>
         </Dialog.Content>
      </Dialog.Positioner>
   </Portal>
</Dialog>