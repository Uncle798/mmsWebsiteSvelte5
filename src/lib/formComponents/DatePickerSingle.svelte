<script lang="ts">
   import { DatePicker, parseDate, Portal, type DateValue } from "@skeletonlabs/skeleton-svelte";
	import { onMount } from "svelte";
	import type { InputConstraint } from "sveltekit-superforms";
   interface Props {
      label?: string;
      minDate?: Date;
      maxDate?: Date;
      classes?: string;
      errors?: string[];
      constraints?: InputConstraint;
      value: Date;
      name: string
   }
   let { maxDate, minDate, label, value=$bindable(), errors, constraints, name, classes }:Props = $props();
   onMount(() => {
      console.log(value);
      if(value){
         dateValue.push(parseDate(value));
      }
   })
   let dateValue = $state<DateValue[]>([]);
</script>
<div class={classes}>
   <DatePicker 
      value={dateValue}
      onValueChange={(e) => {
         dateValue = e.value;
         value = dateValue[0].toDate('UTC');
      }} 
      min={minDate ? parseDate(minDate) : undefined}
      max={maxDate ? parseDate(maxDate) : undefined}
      class='gap-0!'
      numOfMonths={1}
      {name}
   > 
      <DatePicker.Label>{label}</DatePicker.Label>
      <DatePicker.Control>
         <DatePicker.Input index={0} placeholder='Start Date: mm/dd/yyyy' class='' {...constraints} />
         <DatePicker.Trigger />
      </DatePicker.Control>
      <Portal>
         <DatePicker.Positioner>
            <DatePicker.Content>
               <DatePicker.View view='day'>
                     <DatePicker.Context>
                        {#snippet children(date)}
                           <DatePicker.ViewControl>
                              <DatePicker.PrevTrigger />
                              <DatePicker.ViewTrigger disabled>
                                 <DatePicker.RangeText />
                              </DatePicker.ViewTrigger>
                              <DatePicker.NextTrigger />
                           </DatePicker.ViewControl>
                              <DatePicker.Table>
                                 <DatePicker.TableHead>
                                    <DatePicker.TableRow>
                                       {#each date().weekDays as weekDay, id (id)}
                                          <DatePicker.TableHeader>
                                             {weekDay.short}
                                          </DatePicker.TableHeader>
                                       {/each}
                                    </DatePicker.TableRow>
                                 </DatePicker.TableHead>
                                 <DatePicker.TableBody>
                                    {#each date().weeks as week, id (id) }
                                       <DatePicker.TableRow>
                                          {#each week as day, id (id)}
                                             <DatePicker.TableCell value={day}>
                                                <DatePicker.TableCellTrigger>
                                                   {day.day}
                                                </DatePicker.TableCellTrigger>
                                             </DatePicker.TableCell>
                                          {/each}
                                       </DatePicker.TableRow>
                                    {/each}
                                 </DatePicker.TableBody>
                              </DatePicker.Table>
                           {/snippet}
                        </DatePicker.Context>
               </DatePicker.View>
               <DatePicker.View view='year'>
                  <DatePicker.Context>
                     {#snippet children(date)}
                        <DatePicker.ViewControl>
                           <DatePicker.PrevTrigger />
                           <DatePicker.ViewTrigger>
                              <DatePicker.RangeText />
                           </DatePicker.ViewTrigger>
                           <DatePicker.NextTrigger />
                        </DatePicker.ViewControl>
                        <DatePicker.Table>
                           <DatePicker.TableBody>
                              {#each date().getYearsGrid({columns:4}) as years, id (id)}
                                 <DatePicker.TableRow>
                                    {#each years as year, id (id)}
                                       <DatePicker.TableCell value={year.value}>
                                          <DatePicker.TableCellTrigger>{year.label}</DatePicker.TableCellTrigger>
                                       </DatePicker.TableCell>
                                    {/each}
                                 </DatePicker.TableRow>
                              {/each}
                           </DatePicker.TableBody>
                        </DatePicker.Table>
                     {/snippet}
                  </DatePicker.Context>
               </DatePicker.View>
            </DatePicker.Content>
         </DatePicker.Positioner>
      </Portal>
   </DatePicker>
   {#if errors}
      {errors}
   {/if}
</div>