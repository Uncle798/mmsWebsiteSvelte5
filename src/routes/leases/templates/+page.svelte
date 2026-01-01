<script lang="ts">
   import FormMessage from '$lib/formComponents/FormMessage.svelte';
   import type { PageProps } from './$types';
   import { FileUpload } from '@skeletonlabs/skeleton-svelte';
   import {superForm, } from 'sveltekit-superforms'
   import { FileIcon } from 'lucide-svelte';
	import FormSubmitWithProgress from '$lib/formComponents/FormSubmitWithProgress.svelte';
   let { data }: PageProps = $props();
   // svelte-ignore state_referenced_locally
   let { message, errors, constraints, enhance, delayed, timeout, } = superForm(data.leaseUploadForm, {
   });

</script>
<div class="mt-14 sm:mt-12 mb-8 mx-2">
   {#each data.blobs as blob }
   {@const url = blob['url']}
   {@const filename = blob['pathname']}
   {@const downloadUrl = blob['downloadUrl']}
      {#if url}
         {#if filename}
            {#if downloadUrl}
               <a class="anchor" href={url}>{filename}</a>, <a href={downloadUrl} class='anchor'>download</a>
            {/if}
         {/if}
      {/if}
   {/each}
   <FormMessage message={$message} />
   <form method="POST" use:enhance enctype="multipart/form-data">
      <FileUpload name='lease' accept={['application/pdf']} {...$constraints}>
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
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} classes='mt-2'/>
   </form>
</div>