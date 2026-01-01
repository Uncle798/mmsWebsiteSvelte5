<script lang="ts">
   import FormMessage from '$lib/formComponents/FormMessage.svelte';
   import type { PageProps } from './$types';
   import { FileUpload } from '@skeletonlabs/skeleton-svelte';
   import {superForm } from 'sveltekit-superforms'
   import { FileIcon } from 'lucide-svelte';
	import FormSubmitWithProgress from '$lib/formComponents/FormSubmitWithProgress.svelte';
   let { data }: PageProps = $props();
   // svelte-ignore state_referenced_locally
   let { form, message, errors, constraints, enhance, delayed, timeout, } = superForm(data, {

   });
</script>
<FormMessage message={$message} />
<form method="POST" use:enhance>
   <FileUpload name='lease' accept={['application/pdf']}>
      <FileUpload.Label>Lease pdf</FileUpload.Label>
      <FileUpload.Dropzone>
         <FileIcon class='size-10' />
         <div>Select file or drag it here</div>
         <FileUpload.Trigger>Browse files</FileUpload.Trigger>
         <FileUpload.HiddenInput />
      </FileUpload.Dropzone>
      <FileUpload.ItemGroup>
         <FileUpload.Context>
            {#snippet children(fileUpload)}
               {#each fileUpload().acceptedFiles as file (file.name)}
                  <FileUpload.Item {file} >
                     <FileUpload.ItemName>{file.name}</FileUpload.ItemName>
                     <FileUpload.ItemSizeText>{file.size / 1000} kb</FileUpload.ItemSizeText>
                     <FileUpload.ItemDeleteTrigger />
                  </FileUpload.Item>
               {/each}
            {/snippet}
         </FileUpload.Context>
      </FileUpload.ItemGroup>
      <FileUpload.ClearTrigger>Clear files</FileUpload.ClearTrigger>
   </FileUpload>
   <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} />
</form>