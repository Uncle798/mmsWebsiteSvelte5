<script lang="ts">
	import { onMount } from 'svelte';
   
   let currentTheme = $state('');
   function setTheme(event:Event){
      const select = event.target as HTMLSelectElement;
      const theme = select.value;
      
      const themeNames:string[] = [];
      THEMES.forEach((theme) =>{
         themeNames.push(theme.name.substring(0, theme.name.indexOf('.')))
      })
      console.log(theme)
      if(themeNames.includes(theme)){
         const year = 60*60*24*365;
         const thisPage = window.location.pathname;
         document.cookie = `theme=${theme}; max-age=${year}; path=/; SameSite=Lax`
         document.documentElement.setAttribute('data-theme', theme);
         currentTheme=theme;
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
         {#each THEMES as theme}
            {#if theme.name === currentTheme}
               <option value={theme.name.substring(0, theme.name.indexOf('.'))} class="capitalize" selected>{theme.name.substring(0, theme.name.indexOf('.'))}</option>
            {:else}
               <option value={theme.name.substring(0, theme.name.indexOf('.'))} class="capitalize">{theme.name.substring(0, theme.name.indexOf('.'))}</option>
            {/if}
         {/each}
      </select>
   </label>
</div>