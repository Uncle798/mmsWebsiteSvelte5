<script lang="ts">
   import type { InputConstraint} from 'sveltekit-superforms';

   interface Props {
      value: number | undefined | null;
      label: string | undefined;
      errors: string[] | undefined;
      constraints: InputConstraint | undefined;
      placeholder?: string | undefined;
      name: string | null | undefined;
      classes?: string;
   }
   let { value = $bindable(), label, errors, constraints, placeholder, name, classes,  ...others }:Props = $props()
</script>
<div class="{classes}">
   <label class="label">
      {#if label}<span class="label-text">{label}</span><br />{/if}
      <input
         type="number"
         class="input"
         name={name}
         bind:value={value}
         aria-invalid={errors ? 'true' : undefined}
         placeholder={placeholder}
         {...constraints}
         {...others}
      />
   </label>
   {#if errors}<span class="invalid">{errors}</span>{/if}
</div>