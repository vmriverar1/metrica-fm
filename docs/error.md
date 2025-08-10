 ⚡ root@localhost  ~/proyectos/freelos/metrica   master ±  npm run build

> nextn@0.1.0 build
> next build

   ▲ Next.js 15.3.3

   Creating an optimized production build ...
 ⚠ Compiled with warnings in 4.0s

./src/app/blog/page.tsx
Attempted import error: 'OptimizedLoading' is not exported from '@/components/loading/OptimizedLoading' (imported as 'OptimizedLoading').

Import trace for requested module:
./src/app/blog/page.tsx

./src/app/blog/page.tsx
Attempted import error: 'OptimizedLoading' is not exported from '@/components/loading/OptimizedLoading' (imported as 'OptimizedLoading').

Import trace for requested module:
./src/app/blog/page.tsx

./src/app/careers/page.tsx
Attempted import error: 'OptimizedLoading' is not exported from '@/components/loading/OptimizedLoading' (imported as 'OptimizedLoading').

Import trace for requested module:
./src/app/careers/page.tsx

./src/app/careers/page.tsx
Attempted import error: 'OptimizedLoading' is not exported from '@/components/loading/OptimizedLoading' (imported as 'OptimizedLoading').

Import trace for requested module:
./src/app/careers/page.tsx

./src/app/careers/page.tsx
Attempted import error: 'OptimizedLoading' is not exported from '@/components/loading/OptimizedLoading' (imported as 'OptimizedLoading').

Import trace for requested module:
./src/app/careers/page.tsx

./src/app/careers/page.tsx
Attempted import error: 'OptimizedLoading' is not exported from '@/components/loading/OptimizedLoading' (imported as 'OptimizedLoading').

Import trace for requested module:
./src/app/careers/page.tsx

 ✓ Compiled successfully in 9.0s
   Skipping validation of types
   Skipping linting
 ✓ Collecting page data    
 ⚠ metadataBase property in metadata export is not set for resolving social open graph or twitter images, using "http://localhost:3000". See https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase
Error occurred prerendering page "/careers/job/1". Read more: https://nextjs.org/docs/messages/prerender-error
Error: Event handlers cannot be passed to Client Component props.
  {job: ..., onApply: function onApply}
                      ^^^^^^^^^^^^^^^^
If you need interactivity, consider converting part of this to a Client Component.
    at e$ (/root/proyectos/freelos/metrica/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:17:23404)
    at Object.toJSON (/root/proyectos/freelos/metrica/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:17:14854)
    at stringify (<anonymous>)
    at eF (/root/proyectos/freelos/metrica/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:17:26079)
    at eq (/root/proyectos/freelos/metrica/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:17:26391)
    at ez (/root/proyectos/freelos/metrica/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:17:26887)
    at /root/proyectos/freelos/metrica/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:17:14528
    at node:internal/process/task_queues:151:7
    at AsyncResource.runInAsyncScope (node:async_hooks:214:14)
    at AsyncResource.runMicrotask (node:internal/process/task_queues:148:8)
Export encountered an error on /careers/job/[id]/page: /careers/job/1, exiting the build.
 ⨯ Next.js build worker exited with code: 1 and signal: null