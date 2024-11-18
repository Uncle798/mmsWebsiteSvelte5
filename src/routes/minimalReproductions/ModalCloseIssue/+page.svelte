<script lang="ts">
   import { Modal } from '@skeletonlabs/skeleton-svelte';
   import { superForm } from 'sveltekit-superforms';
    import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();
   let modalOpen = $state(false);
   let form1 = $state(true);
   let { form, errors, constraints, message, enhance,} = superForm(data.form, {
      onSubmit(){

      }, 
      onUpdated() {
         form1 = false;
       },
   });
   let { form:form2,  enhance:enhance2,  } = superForm(data.form2, {
      onSubmit(){

      }, 
      onUpdated() {
         form1=true
       },
   });
</script>

<Modal
   bind:open={modalOpen}
   triggerBase="btn preset-tonal"
   contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
   backdropClasses="backdrop-blur-sm"
>
   {#snippet trigger()}
      Open modal
   {/snippet}
   {#snippet content()}
      {#if form1}
      <form action='/minimalReproductions/ModalCloseIssue?/form' method="POST" use:enhance>
         <label for="name">Name: {data.name}</label>
         <input type="text" name="name" class="input" bind:value={$form.name}>
         <button class="btn">Submit</button>
      </form>
      {:else}
      <form action="/minimalReproductions/ModalCloseIssue?/form2" method="POST" use:enhance2>
         <label for="value">Value: {data.value}
            <input type="text" name="value" class="input" bind:value={$form2.value}>
         </label>
         <label for="value2">Value2: {data.value2}
            <input type="text" name="value2" class="input" bind:value={$form2.value2}>
         </label>
         <button class="btn">Submit</button>
      </form>
      {/if}
   {/snippet}
</Modal>