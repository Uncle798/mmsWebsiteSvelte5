<script lang="ts">
   import type { PageData } from "./$types";
   interface Props {
      data: PageData;
   }
   let { data }: Props = $props();
</script>


{#if data.user}
   You're logged in {data.user.givenName} 
   {:else}
   You're not logged in 
{/if}