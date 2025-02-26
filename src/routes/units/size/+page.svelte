<script lang="ts">
	import { goto } from '$app/navigation';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
   import { XCircleIcon } from 'lucide-svelte';
   import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();
   let sizeMenuOpen = $state(false)

</script>
<div class="flex sticky top-20 dark:bg-tertiary-950 bg-tertiary-50 rounded-b-lg w-full h-16">
   <Modal
      bind:open={sizeMenuOpen}
      triggerBase="btn preset-filled-primary-50-950 hover:shadow-xl hover:border-2 border-secondary-50 dark:border-secondary-950 fixed top-10 z-50 mx-1 sm:mx-2 text-wrap w-14 sm:w-fit h-fit rounded-md sm:round-lg"
      contentBase="bg-surface-100-900 p-2 space-y-2 shadow-xl w-[120px] h-fit relative"
      positionerJustify="justify-start"
      positionerAlign=""
      positionerPadding="pt-10"
      transitionsPositionerIn={{ x: -120, duration: 400 }}
      transitionsPositionerOut={{ x: -120, duration: 400 }}
   >
      {#snippet trigger()}
         Select Size
      {/snippet}
      {#snippet content()}
         <ul>
            {#each data.sizes as size}
               {#if size !== 'ours'}          
                  <li>
                     <a href="/units/size/{size}" class="anchor">{size.replace(/^0+/gm, '').replace(/x0/gm,'x')}</a>
                  </li>
               {/if}
            {/each}
         </ul>
         <div class="absolute top-0 right-1"><button onclick={()=>sizeMenuOpen=false}><XCircleIcon size='14'/></button></div>
      {/snippet}
   </Modal>

</div>