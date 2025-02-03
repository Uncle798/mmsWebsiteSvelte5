<script lang="ts">

   interface Props {
      label: string;
      onClick?: ()=>void;
      classes?: string;
      type: 'button' | 'submit' | 'reset' | null | undefined
   }
   let { label, onClick, classes, type }:Props = $props();

</script>

<button class="btn {classes}" {type}>{label}</button>