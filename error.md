Hydration failed because the server rendered HTML didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

See more info here: https://nextjs.org/docs/messages/react-hydration-error


  ...
    <InnerScrollAndFocusHandler segmentPath={[...]} focusAndScrollRef={{apply:false, ...}}>
      <ErrorBoundary errorComponent={undefined} errorStyles={undefined} errorScripts={undefined}>
        <LoadingBoundary loading={null}>
          <HTTPAccessFallbackBoundary notFound={[...]} forbidden={undefined} unauthorized={undefined}>
            <HTTPAccessFallbackErrorBoundary pathname="/" notFound={[...]} forbidden={undefined} unauthorized={undefined} ...>
              <RedirectBoundary>
                <RedirectErrorBoundary router={{...}}>
                  <InnerLayoutRouter url="/" tree={[...]} cacheNode={{lazyData:null, ...}} segmentPath={[...]}>
                    <Home>
                      <div className="bg-backgro...">
                        <CustomCursor>
                        <Header>
                        <main>
                          <HeroTransform>
                          <Stats>
                          <Services>
                          <Portfolio>
                          <Pillars>
                          <section>
                          <Clients>
                          <Newsletter>
                            <section id="newsletter" className="py-24 bg-p...">
                              <div className="container ...">
                                <h2>
                                <p>
                                <form className="mt-8 max-w...">
                                  <Input>
                                    <input
                                      type="email"
                                      className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-base r..."
                                      placeholder="Tu correo electrónico"
-                                     wfd-id="id0"
                                    >
                                  ...
                        ...
                    ...
src/components/ui/input.tsx (8:7) @ Input


   6 |   ({ className, type, ...props }, ref) => {
   7 |     return (
>  8 |       <input
     |       ^
   9 |         type={type}
  10 |         className={cn(
  11 |           "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
Call Stack
19

Show 15 ignore-listed frame(s)
input
<anonymous> (0:0)
Input
src/components/ui/input.tsx (8:7)
Newsletter
src/components/landing/newsletter.tsx (16:11)
Home
src/app/page.tsx (26:9)