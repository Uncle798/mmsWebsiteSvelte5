<script lang='ts'>
   interface Props {
      message: string | null,
   }
   let { message = $bindable(), }:Props = $props();
</script>

{#if message}
   <span class="text-error-200-800 font-extrabold text-lg">{message}</span>
{/if}