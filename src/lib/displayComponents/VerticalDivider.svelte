<script lang="ts">
   interface Props {
      heightClass: string;
   }
   let { heightClass,  }:Props = $props()
</script>

<div class="grid {heightClass} grid-cols-[1fr_auto_auto_auto_auto_1fr] items-center">
   <span class="vr border-l-2"></span>
</div>