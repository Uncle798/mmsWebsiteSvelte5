<script lang="ts">
	import type { SearchFormSchema } from '$lib/formSchemas/schemas';
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
			console.log(search);
		}
	});
</script>

<div class="m-4 {classes}">
	<form method="POST" use:enhance>
		<label class="label-text"
			>Search by {searchType}
			<input
				type="search"
				name="search"
				id="search"
				class="input mb-2 mt-1"
				placeholder="Search by {searchType} ..."
				bind:value={search}
			/>
			<button
				class="btn rounded-lg bg-primary-950"
				type="button"
				onclick={() => {
					$form.search = '';
					search = '';
				}}>Clear search</button
			>
		</label>
	</form>
</div>
