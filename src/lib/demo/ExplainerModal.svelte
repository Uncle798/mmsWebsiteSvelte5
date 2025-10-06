<script lang='ts'>
   import { Modal } from "@skeletonlabs/skeleton-svelte";
	import type { Snippet } from "svelte";
   interface Props {
      modalOpen: boolean
      copy: Snippet
   }
   let { modalOpen=$bindable(), copy }:Props = $props()
</script>

<Modal
   open={modalOpen}
   onOpenChange={(event) =>(modalOpen = event.open)}
   contentBase='card bg-surface-100-900 p-2 space-y-4 shadow-xl max-w-screen-sm'
   backdropClasses='backdrop-blur-lg'
>
   {#snippet content()}
      <div>
         {@render copy()}
      </div>
      <div>
         <button class="btn preset-tonal" onclick={()=>(modalOpen=false)}>Close</button>
      </div>
   {/snippet}
</Modal>