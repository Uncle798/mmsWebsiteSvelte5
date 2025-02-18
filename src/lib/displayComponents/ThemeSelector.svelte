<script lang="ts">
   import * as themes from '@skeletonlabs/skeleton/themes'
   const themeNames = Object.keys(themes)
   let currentTheme = $state(themeNames[0]);
   $effect(()=>{
      if(typeof window !== undefined){
         const theme = window.localStorage.getItem('theme');
         if(theme && themeNames.includes(theme)){
            document.documentElement.setAttribute('data-theme', theme);
            currentTheme=theme
         }
      }
   })
   function setTheme(event:Event){
      const select = event.target as HTMLSelectElement;
      const theme = select.value
      console.log(theme)
      if(themeNames.includes(theme)){
         const year = 60*60*24*365
         window.localStorage.setItem('theme', theme);
         document.cookie = `theme=${theme}; max-age=${year}; path=/; SameSite=Lax`
         document.documentElement.setAttribute('data-theme', theme);
         currentTheme=theme
      }
   }
</script>
<div>
   <label for="themeSelect" class="label-text mx-2">Theme Selector
      <select name="themeSelect" id="themeSelect" class="select w-72 m-2" bind:value={currentTheme} onchange={setTheme}>
         {#each themeNames as themeName}
            <option value={themeName} class=" capitalize">{themeName}</option>
         {/each}
      </select>
   </label>
</div>