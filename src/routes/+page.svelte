<script lang="ts">
	import { PUBLIC_COMPANY_NAME } from "$env/static/public";
   import PalouseHills from '$lib/Photos/Palouse_hills_northeast_of_Walla_Walla.jpg'
   import Header from "$lib/Header.svelte";
   import type { PageData } from "./$types";
   interface Props {
      data: PageData;
   }
   let { data }: Props = $props();
</script>

<Header title='Home' />
{#if data.user}
   Welcome to the {PUBLIC_COMPANY_NAME} home page, {data.user.givenName} 
   {:else}
   <article>
      <div>
         Welcome to the {PUBLIC_COMPANY_NAME} home page. Nestled in the hills of the Palouse just outside Moscow off the Troy Highway {PUBLIC_COMPANY_NAME} is the place to safely and securely store your belongings.
         Family owned and operated since 1993, {PUBLIC_COMPANY_NAME} is open from 8:00 a.m. to 8:00 p.m. seven days a week. 

      </div>
   </article>
{/if}
 <p>See what <a href="/units/available">units we have available</a></p>