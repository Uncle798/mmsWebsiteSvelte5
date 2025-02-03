<script lang='ts'>
   import type { InputConstraint } from "sveltekit-superforms";
   interface Props {
      value: string | undefined;
      label: string | undefined;
      errors: string[] | undefined;
      constraints: InputConstraint | undefined;
      groupName: string | null | undefined;
      id: string | undefined;
   }
   let { value = $bindable(), label, errors, constraints, groupName, id }:Props = $props();
</script>
<div class="flex items-center m-2 ">
   <label for="radio"><span class="label-text">{label}</span>
      <input
      type="radio"
      name={groupName}
      id={id}
      class="radio"
      bind:value={value}
      {...constraints}
      />
   </label>
   {#if errors}
   <span class="invalid">{errors}</span>
   {/if}
</div>