<script lang="ts">
   import { PUBLIC_COMPANY_NAME } from "$env/static/public";
   interface Props {
      title: string
   }
   let { title }:Props = $props()
</script>
<svelte:head>
	<title>{PUBLIC_COMPANY_NAME} | {title}</title>
</svelte:head>