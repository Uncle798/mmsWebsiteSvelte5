<script lang="ts">
	import DateInput from '$lib/formComponents/DateInput.svelte';
	import type { DateSearchFormSchema } from '$lib/formSchemas/schemas';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';

	interface Props {
		data: SuperValidated<Infer<DateSearchFormSchema>>;
		startDate: Date | undefined;
		endDate: Date | undefined;
		minDate: Date | undefined;
		maxDate: Date | undefined;
		classes?: string;
	}
	let {
		data,
		startDate = $bindable(),
		endDate = $bindable(),
		minDate,
		maxDate,
		classes
	}: Props = $props();

	let { form, message, enhance, constraints, errors } = superForm(data, {
		onChange(event) {
			startDate = dayjs(event.get('startDate')).toDate();
			endDate = dayjs(event.get('endDate')).toDate();
		}
	});
	onMount(() => {
		$form.startDate = startDate;
		$form.endDate = endDate;
	});
</script>

<div class="{classes}">
	<form method="POST" use:enhance>
		<div class="flex gap-1">
			<div>
				<DateInput
					bind:value={$form.startDate}
					errors={$errors.startDate}
					constraints={$constraints.startDate}
					label="Start date"
					name="startDate"
					min={minDate}
					max={maxDate}
				/>
				<button
					class="btn rounded-lg preset-filled-primary-50-950"
					type="button"
					onclick={() => {
						$form.startDate = undefined;
						startDate = undefined;
					}}>Clear start date</button
				>
			</div>
			<div>
				<DateInput
					bind:value={$form.endDate}
					errors={$errors.endDate}
					constraints={$constraints.endDate}
					label="End date"
					name="endDate"
					min={minDate}
					max={maxDate}
				/>
				<button
					class="btn preset-filled-primary-50-950 rounded-lg"
					type="button"
					onclick={() => {
						$form.endDate = undefined;
						endDate = undefined;
					}}>Clear end date</button
				>
			</div>
		</div>
	</form>
</div>
