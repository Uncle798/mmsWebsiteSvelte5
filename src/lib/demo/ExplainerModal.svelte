<script lang='ts'>
   import { Modal } from "@skeletonlabs/skeleton-svelte";
   interface Props {
      modalOpen: boolean
      copy: string
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
      <p>
         {copy}
      </p>
      <button class="btn preset-tonal" onclick={()=>(modalOpen=false)}>Close</button>
   {/snippet}
</Modal>