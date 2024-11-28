<script lang="ts">
	import { page } from "$app/stores";
	import { PUBLIC_COMPANY_NAME } from "$env/static/public";
   import Header from "$lib/Header.svelte";
import type { PageData } from "./$types";
   interface Props {
      data: PageData;
   }
   let { data }: Props = $props();
</script>

<Header title='Home' />
{#if data.user}
   Welcome to the {PUBLIC_COMPANY_NAME} home page, {data.user.givenName} 
   {:else}
   Welcome to the {PUBLIC_COMPANY_NAME} home page. 
{/if}