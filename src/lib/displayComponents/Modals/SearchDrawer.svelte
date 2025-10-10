<script lang='ts'>
	import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
	import { CircleX, Search } from "lucide-svelte";
	import type { Snippet } from "svelte";

   interface Props {
      modalOpen: boolean;
      content: Snippet;
      height: string;
   }
   let { modalOpen=$bindable(false), content, height }:Props = $props()
</script>

<Dialog>
   <Dialog.Trigger class='z-50 fixed right-0 top-0 btn preset-filled-primary-50-950 h-8'><Search class='z-51'/></Dialog.Trigger>
   <Portal>
      <Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-50-950/50 
         transition transition-discrete opacity-0 
         starting:data-[state=open]:opacity-0 data-[state=open]:opacity-100"
      />
      <Dialog.Positioner class="fixed top-0 left-0 z-50 flex">
         <Dialog.Content class='w-screen {height} card 
            bg-surface-100-900 p-4 shadow-xl 
            transition transition-discrete opacity-0 -translate-y-full 
            starting:data-[state=open]:opacity-0 starting:data-[state=open]:-translate-y-full 
            data-[state=open]:opacity-100 data-[state=open]:translate-y-0'
         >
         <header>
            <Dialog.CloseTrigger class='fixed right-2 top-2'><CircleX /></Dialog.CloseTrigger> 
         </header>
            <Dialog.Description class=''>
               {@render content()}
            </Dialog.Description>
         </Dialog.Content>
      </Dialog.Positioner>
   </Portal>
</Dialog>