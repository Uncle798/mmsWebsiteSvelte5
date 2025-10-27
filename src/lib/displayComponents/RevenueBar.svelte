<script lang='ts'>
	import type { Snippet } from "svelte";

interface Props {
   content: Snippet;
   classes?: string; 
}
let { content, classes }:Props = $props()
</script>

<div class="bg-tertiary-50-950 w-screen rounded-b-lg fixed top-10 sm:top-7 p-1 flex z-30 {classes}">
   {@render content()}
</div>