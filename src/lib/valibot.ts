import { valibot as _valibot } from 'sveltekit-superforms/adapters';

/**
 * Wrapper around superforms' valibot adapter that tells @valibot/to-json-schema
 * to silently skip actions with no JSON Schema equivalent (check, rawCheck, forward, etc.)
 */
export const valibot: typeof _valibot = (schema, options?) =>
	_valibot(schema, {
		...options,
		errorMode: 'ignore'
	} as any);
