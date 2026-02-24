<script lang="ts">
   interface Props {
      label: string;
      onClick?: ()=>void;
      classes?: string;
      disabled?: boolean;
      type: 'button' | 'submit' | 'reset' | null | undefined
   }
   let { label, onClick, classes, type, disabled }:Props = $props();

</script>

<button 
   class="btn preset-filled-primary-50-950 h-8 {classes}" 
   {type}
   onclick={onClick}
   disabled={disabled}
>
   {label}
</button>