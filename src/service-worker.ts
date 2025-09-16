/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />
/// <reference types="../.svelte-kit/ambient.d.ts" />

import { build, files, version } from "$service-worker"

const self = globalThis.self as unknown as ServiceWorkerGlobalScope;

const cacheName = `cache-${version}`;

const ASSETS = [
   ...build, 
   ...files
]

self.addEventListener('install', (event) => {
   async function addFilesToCache() {
      const cache = await caches.open(cacheName);
      await cache.addAll(ASSETS);
   }
   event.waitUntil(addFilesToCache());
})

self.addEventListener('activate', (event) => {
   async function deleteOldCaches() {
      for(const key of await caches.keys()){
         if(key !== cacheName){
            await caches.delete(key);
         }
      }
   }
   event.waitUntil(deleteOldCaches());
})

self.addEventListener('fetch', (event) => {
   if(event.request.method !== 'GET'){
      return;
   }
   async function respond() {
      const url = new URL(event.request.url);
      const cache = await caches.open(cacheName);
      if(ASSETS.includes(url.pathname)){
         const response = await cache.match(url.pathname);
         if(response){
            return response;
         }
      }
      try {
         const response = await fetch(event.request);
         if(!(response instanceof Response)){
            throw new Error('invalid response from fetch');
         }
         if(response.status === 200){
            cache.put(event.request, response.clone())
         }
         return response;
      }catch (error) {
         const response = await cache.match(event.request);
         if(response){
            return response;
         }
         throw error;
      }
   }
   event.respondWith(respond());
})