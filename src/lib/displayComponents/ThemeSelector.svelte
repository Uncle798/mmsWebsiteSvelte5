<script lang="ts">
   import * as themes from '@skeletonlabs/skeleton/themes'
	import { onMount } from 'svelte';
   const themeNames = Object.keys(themes)
   let currentTheme = $state('');
   function setTheme(event:Event){
      const select = event.target as HTMLSelectElement;
      const theme = select.value;
      if(themeNames.includes(theme)){
         const year = 60*60*24*365;
         const thisPage = window.location.pathname;
         document.cookie = `theme=${theme}; max-age=${year}; path=/; SameSite=Lax`
         document.documentElement.setAttribute('data-theme', theme);
         currentTheme=theme;
         location.reload();
      }
   }
   onMount(()=>{
      const cookie = document.cookie
      console.log(cookie.indexOf('='))
      const indexOfTheme = cookie.indexOf('theme=');
      const lastIndexOfSemi = cookie.lastIndexOf(';');
      let endOfString = undefined;
      if(lastIndexOfSemi > indexOfTheme){
         endOfString = cookie.indexOf(';', indexOfTheme);
      }
      const docTheme = cookie.substring(indexOfTheme+6, endOfString)
      console.log(docTheme)
      if(docTheme){
         currentTheme = docTheme
      }
   })
</script>
<div>
   <label for="themeSelect" class="label-text mx-2">Theme Selector
      <select name="themeSelect" id="themeSelect" class="select w-72 m-2" bind:value={currentTheme} onchange={setTheme}>
         {#each themeNames as themeName}
            {#if themeName === currentTheme}
               <option value={themeName} class="capitalize" selected>{themeName}</option>
            {:else}
               <option value={themeName} class="capitalize">{themeName}</option>
            {/if}
         {/each}
      </select>
   </label>
</div>