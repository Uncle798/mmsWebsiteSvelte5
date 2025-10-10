<script lang="ts">
   import { Switch } from "@skeletonlabs/skeleton-svelte";
   interface Props {
      checked: boolean;
      name: string;
      label: string;
      classes?: string;
   }
   let { checked=$bindable(), name, label, classes }:Props = $props();
</script>
<div class={classes}>
   <Switch {checked} {name} onCheckedChange={(e) => checked = e.checked}>
      <Switch.Control>
         <Switch.Thumb />
      </Switch.Control>
      <Switch.Label>
         {label}
      </Switch.Label>
      <Switch.HiddenInput />
   </Switch>
</div>