// See https://svelte.dev/docs/kit/types#app.d.ts

import type { PartialUser } from "$lib/server/partialTypes";
import type { Session } from "@prisma/client";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: PartialUser | null;
			session: Session | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	const THEMES: {
		name: string,
		content: string
	}[];
}

export {};
