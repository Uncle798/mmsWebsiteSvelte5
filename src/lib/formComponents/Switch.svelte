<script lang="ts">
   import { Switch } from "@skeletonlabs/skeleton-svelte";
   export interface CheckedChangeDetails {
      checked: boolean
   }
   interface Props {
      checked: boolean;
      name: string;
      label: string;
      classes?: string;
      onCheckedChange?: (e:CheckedChangeDetails) => void;

   }
   let { checked=$bindable(), name, label, classes, onCheckedChange = (e) => {checked = e.checked} }:Props = $props();
</script>
<div class={classes}>
   <Switch {checked} {name} {onCheckedChange}>
      <Switch.Control>
         <Switch.Thumb />
      </Switch.Control>
      <Switch.Label>
         {label}
      </Switch.Label>
      <Switch.HiddenInput />
   </Switch>
</div>