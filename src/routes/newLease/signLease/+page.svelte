<script lang="ts">
	import { onMount } from 'svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
    let iframe = $state(document.createElement('iframe'));
    onMount(() => {
        if(data.contract){
            iframe.src = data.contract.url;
            iframe.title = data.contract.filename;
        }
        window.addEventListener('message', (event) => {
            if(event.origin !== ''){
                
            }
        })
    });
</script>
<div class="mt-14 sm:mt-12 mb-10 mx-2">
    {#if data.contract?.url}
        <!-- svelte-ignore a11y_missing_attribute -->
        <iframe bind:this={iframe}>
        </iframe>
    {/if}
</div>