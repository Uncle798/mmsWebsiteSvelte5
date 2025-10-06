<script lang="ts">
	import { Combobox } from '@skeletonlabs/skeleton-svelte';
	import { onMount } from 'svelte';
   
   let currentTheme = $state(['']);
   interface ComboBoxData {
      label: string;
      value: string;
   }

   const themeNames:string[] = [];
   const themeComboboxData:ComboBoxData[] =[]
   THEMES.forEach((theme) =>{
         themeNames.push(theme.name)
         themeComboboxData.push({
            label:theme.name.charAt(0).toUpperCase() + theme.name.substring(1), 
            value:theme.name
         })
   });
   function setTheme(themeName:string){
      if(themeNames.includes(themeName)){
         const year = 60*60*24*365;
         const thisPage = window.location.pathname;
         document.cookie = `theme=${themeName}; max-age=${year}; path=/; SameSite=Lax`
         document.documentElement.setAttribute('data-theme', themeName);
         currentTheme[0]=themeName;
      }
   }
   onMount(()=>{
      const cookie = document.cookie
      const indexOfTheme = cookie.indexOf('theme=');
      const lastIndexOfSemi = cookie.lastIndexOf(';');
      let endOfString = 0;
      if(lastIndexOfSemi > indexOfTheme){
         endOfString = cookie.indexOf(';', indexOfTheme);
      }
      const docTheme = cookie.substring(indexOfTheme+6, endOfString)
      if(docTheme){
         currentTheme[0] = docTheme
      }
   })


</script>
<div class="mx-1 sm:mx-2">

   <Combobox
      data={themeComboboxData}
      value={currentTheme}
      label='Select Theme:'
      placeholder='Select Theme...'
      openOnClick={true}
      onValueChange={(details) =>setTheme(details.value[0])}
   />
   
</div>