<script lang="ts">
   import { DatePicker, parseDate, Portal, type DateValue } from "@skeletonlabs/skeleton-svelte";
	import { onMount } from "svelte";
   interface Props {
      label?: string;
      minDate?: Date;
      maxDate?: Date;
      classes?: string;
      values: Date[];
   }
   let { maxDate, minDate, label, values=$bindable(), classes }:Props = $props();
   let dateValue = $state<DateValue[]>([]);
   onMount(() => {
      for(const value of values){
         dateValue.push(parseDate(value))
      }
   })
</script>
<div class={classes}>
   <DatePicker 
      value={dateValue}
      onValueChange={(e) => {
         console.log(e)
         dateValue = e.value;
         values = [];
         for(const value of dateValue){
            values.push(value.toDate('UTC'))
         }
      }} 
      min={minDate ? parseDate(minDate) : undefined}
      max={maxDate ? parseDate(maxDate) : undefined}
      selectionMode="range"
      class='gap-0! z-50'
      numOfMonths={2}
   > 
      <DatePicker.Label>{label}</DatePicker.Label>
      <DatePicker.Control>
         <DatePicker.Input index={0} placeholder='Start Date: mm/dd/yyyy' class=''/>
         <DatePicker.Input index={1} placeholder='End Date: mm/dd/yyyy' class=''/>
         <DatePicker.Trigger />
      </DatePicker.Control>
      <Portal>
         <DatePicker.Positioner>
            <DatePicker.Content>
               <DatePicker.YearSelect />
               <DatePicker.MonthSelect />
               <DatePicker.View view='day'>
                  <DatePicker.Context>
                     {#snippet children(date)}
                     {@const offset = date().getOffset({months: 1})}
                        <DatePicker.ViewControl>
                           <DatePicker.PrevTrigger />
                           <DatePicker.ViewTrigger disabled>
                              <DatePicker.RangeText />
                           </DatePicker.ViewTrigger>
                           <DatePicker.NextTrigger />
                        </DatePicker.ViewControl>
                           <div class="flex flex-row gap-2">
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
                                          {#each offset.weeks as week, id (id) }
                                             <DatePicker.TableRow>
                                                {#each week as day, id (id)}
                                                   <DatePicker.TableCell value={day} visibleRange={offset.visibleRange} >
                                                      <DatePicker.TableCellTrigger>
                                                         {day.day}
                                                      </DatePicker.TableCellTrigger>
                                                   </DatePicker.TableCell>
                                                {/each}
                                             </DatePicker.TableRow>
                                          {/each}
                                       </DatePicker.TableBody>
                                    </DatePicker.Table>
                           </div>
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
</div>