<script lang="ts">
   import type { InputConstraint } from "sveltekit-superforms";
   interface Props {
      value?:boolean;
      label: string;
      errors?: string[];
      constraints?: InputConstraint;
      name?: string | null;
      onChange?: (e:Event & {
         currentTarget: EventTarget & HTMLInputElement
      }) => void;
   }
   let { value = $bindable(), label, errors, constraints, name, onChange }:Props = $props()
</script>
<label for="checkbox" class="label"><span class="label-text">{label}</span>
      <input 
         type="checkbox" 
         name={name} 
         class="checkbox" 
         bind:checked={value}
         aria-invalid={errors ? 'true' : undefined}
         onchange={onChange}
         {...constraints}
      />
</label>
{#if errors}<span class="invalid">{errors}</span>{/if}