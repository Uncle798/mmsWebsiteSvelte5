<script lang='ts'>
   import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
	import { CircleX, } from "lucide-svelte";
	import type { Snippet } from "svelte";
   interface Props {
      modalOpen: boolean;
      copy: Snippet;
      title?: string;
   }
   let { modalOpen=$bindable(), copy, title }:Props = $props()
</script>

<Dialog open={modalOpen}>
   <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
         <Dialog.Content class='card bg-surface-100-900 p-2 space-y-4 shadow-xl max-w-screen-sm' >
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Description>
               <header >
                  <Dialog.CloseTrigger><CircleX class='fixed right-1' /></Dialog.CloseTrigger>
               </header>
               {@render copy()}
            </Dialog.Description>
            <Dialog.CloseTrigger class='btn preset-filled-primary-50-950'>Close</Dialog.CloseTrigger>
         </Dialog.Content>
      </Dialog.Positioner>
   </Portal>
</Dialog>