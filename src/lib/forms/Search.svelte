<script lang="ts">
	import type { SearchFormSchema } from '$lib/formSchemas/schemas';
	import { onMount } from 'svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';

	interface Props {
		data: SuperValidated<Infer<SearchFormSchema>>;
		search: string;
		searchType: string;
		classes?: string;
	}
	let { data, search = $bindable(''), searchType, classes }: Props = $props();
	let { form, enhance } = superForm(data, {
		onChange(event) {
			search = event.get('search');
			if(event.target){
            const formName = 'searchForm'
            const value = event.get(event.path);
            if(value){
               sessionStorage.setItem(`${formName}:${event.path}`, value);
            }
         }
		}
	});
	onMount(() => {
		for(const key in $form){
         let fullKey = `searchForm:${key}`;
         const storedValue = sessionStorage.getItem(fullKey)
         if(storedValue){
            $form[key as keyof typeof $form] = storedValue;
         }
      }
	})
</script>

<div class="{classes}">
	<form method="POST" use:enhance>
		<label class="label-text"
			>Search by {searchType}
			<input
				type="search"
				name="search"
				id="search"
				class="input"
				placeholder="Search by {searchType}..."
				bind:value={search}
			/>
			<button
				class="btn rounded-lg preset-filled-primary-50-950 my-1"
				type="button"
				onclick={() => {
					$form.search = '';
					search = '';
				}}>Clear search</button
			>
		</label>
	</form>
</div>
