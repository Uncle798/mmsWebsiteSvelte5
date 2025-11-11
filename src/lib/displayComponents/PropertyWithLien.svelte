<script lang="ts">
   import type { PropertyWithLien } from "@prisma/client";

   interface Props {
      property:PropertyWithLien,
      classes?: string
   }
   let { property, classes }:Props = $props();
</script>
<div class={classes}>
   <div>Description</div>
   <div><a href="/propertyWithLien/{property.id}" class="anchor">{property.descriptionOfProperty}</a></div>
</div>