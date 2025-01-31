<script lang="ts">
   interface Props {
      heightClass: string;
   }
   let { heightClass,  }:Props = $props()
</script>

<div class="grid container {heightClass} grid-cols-[1fr_auto_auto_auto_auto_1fr] items-center w-8 m-0 p-0">
   <span class="vr border-l-2"></span>
</div>