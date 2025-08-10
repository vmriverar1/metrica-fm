on-recoverable-error.js:28 Uncaught Error: Hydration failed because the server rendered text didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch

  ...
    <CareersPage>
      <div className="bg-backgro...">
        <Header>
        ...
          <main className="min-h-scre...">
            <Suspense>
            <SectionTransition>
            <Suspense>
            <section>
            <SectionTransition>
            <section className="py-16">
              <div className="container ...">
                <Suspense fallback={<OptimizedLoading>}>
                  <CareerFilters>
                    <div className="bg-backgro...">
                      <div className="container ...">
                        <div className="space-y-6">
                          <div>
                          <div>
                          <div>
                          <div className="space-y-3">
                            <div className="flex items...">
                              <DollarSign>
                              <span className="text-sm fo...">
+                               20.000
-                               20,000
                            ...
                          ...
                  ...
            ...
        ...

    at CareersPage (page.tsx:57:17)
