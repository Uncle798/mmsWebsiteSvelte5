<script lang="ts">
	import type { SearchFormSchema } from "$lib/formSchemas/schemas";
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";

   interface Props {
      data: SuperValidated<Infer<SearchFormSchema>>;
      search: string;
      searchType: string;
   }
   let { data, search=$bindable(''), searchType }:Props = $props();
   let { form, enhance } = superForm(data, {
      onChange(event){
         search = event.get('search')
      }
   })
</script>

<form method="POST" use:enhance>
   <div class="m-4">
       <label class="label-text">Search by {searchType}
           <input type="search" name="search" id="search" class="input" placeholder="Search by {searchType} ..." bind:value={search}>
           <button class="btn" type="button" onclick={()=> {$form.search = ''; search='' }}>Clear</button>
       </label>
   </div>
</form>