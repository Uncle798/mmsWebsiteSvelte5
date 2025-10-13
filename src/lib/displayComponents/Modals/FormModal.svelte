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
      <Dialog.Positioner class='fixed inset-0 flex justify-center items-center'>
         <Dialog.Content class='card bg-surface-100-900 p-2 shadow-xl max-w-screen-md'>
            <header class="flex justify-between">
               <Dialog.Title class='font-bold text-xl'>{title}</Dialog.Title>
               <Dialog.CloseTrigger><CircleX /></Dialog.CloseTrigger>
            </header>
            <Dialog.Description>
               {@render content()}
            </Dialog.Description>
         </Dialog.Content>
      </Dialog.Positioner>
   </Portal>
</Dialog>