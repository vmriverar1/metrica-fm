header.tsx:180 In HTML, <a> cannot be a descendant of <a>.
This will cause a hydration error.

  ...
    <NavigationMenuCollectionSlot scope={undefined}>
      <NavigationMenuCollectionSlot.Slot ref={function}>
        <NavigationMenuCollectionSlot.SlotClone ref={function}>
          <Primitive.div dir="ltr" asChild={true} ref={function}>
            <Primitive.div.Slot dir="ltr" ref={function}>
              <Primitive.div.SlotClone dir="ltr" ref={function}>
                <Primitive.ul data-orientation="horizontal" className="group flex..." ref={function} dir="ltr">
                  <ul data-orientation="horizontal" className="group flex..." dir="ltr" ref={function}>
                    <NavigationMenuItem>
                      <NavigationMenuItemProvider scope={undefined} value="radix-«Rbi..." triggerRef={{current:null}} ...>
                        <Primitive.li ref={null}>
                          <li ref={null}>
                            <LinkComponent href="#hero" passHref={true}>
>                             <a
>                               ref={function}
>                               onClick={function onClick}
>                               onMouseEnter={function onMouseEnter}
>                               onTouchStart={function onTouchStart}
>                               href="#hero"
>                             >
                                ...
                                  <Primitive.a data-active={undefined} aria-current={undefined} asChild={true} ...>
                                    <Primitive.a.Slot data-active={undefined} aria-current={undefined} ...>
                                      <Primitive.a.SlotClone data-active={undefined} aria-current={undefined} ...>
>                                       <a
>                                         className="group inline-flex h-10 w-max items-center justify-center rounded-..."
>                                         data-active={undefined}
>                                         aria-current={undefined}
>                                         onClick={function handleEvent}
>                                         onKeyDown={function handleEvent}
>                                         data-radix-collection-item=""
>                                         ref={function}
>                                       >
                    ...

error @ intercept-console-error.js:50
validateDOMNesting @ react-dom-client.development.js:2614
beginWork @ react-dom-client.development.js:10770
runWithFiberInDEV @ react-dom-client.development.js:845
performUnitOfWork @ react-dom-client.development.js:15258
workLoopConcurrentByScheduler @ react-dom-client.development.js:15252
renderRootConcurrent @ react-dom-client.development.js:15227
performWorkOnRoot @ react-dom-client.development.js:14525
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16350
performWorkUntilDeadline @ scheduler.development.js:45
<a>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:346
eval @ header.tsx:180
Header @ header.tsx:143
react-stack-bottom-frame @ react-dom-client.development.js:22974
renderWithHooksAgain @ react-dom-client.development.js:6767
renderWithHooks @ react-dom-client.development.js:6679
updateFunctionComponent @ react-dom-client.development.js:8931
beginWork @ react-dom-client.development.js:10505
runWithFiberInDEV @ react-dom-client.development.js:845
performUnitOfWork @ react-dom-client.development.js:15258
workLoopConcurrentByScheduler @ react-dom-client.development.js:15252
renderRootConcurrent @ react-dom-client.development.js:15227
performWorkOnRoot @ react-dom-client.development.js:14525
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16350
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Home @ page.tsx:15
eval @ react-server-dom-webpack-client.browser.development.js:2355
initializeModelChunk @ react-server-dom-webpack-client.browser.development.js:1054
getOutlinedModel @ react-server-dom-webpack-client.browser.development.js:1327
parseModelString @ react-server-dom-webpack-client.browser.development.js:1540
eval @ react-server-dom-webpack-client.browser.development.js:2294
initializeModelChunk @ react-server-dom-webpack-client.browser.development.js:1054
resolveModelChunk @ react-server-dom-webpack-client.browser.development.js:1031
resolveModel @ react-server-dom-webpack-client.browser.development.js:1599
processFullStringRow @ react-server-dom-webpack-client.browser.development.js:2288
processFullBinaryRow @ react-server-dom-webpack-client.browser.development.js:2233
progress @ react-server-dom-webpack-client.browser.development.js:2479
<Home>
buildFakeTask @ react-server-dom-webpack-client.browser.development.js:2040
initializeFakeTask @ react-server-dom-webpack-client.browser.development.js:2027
resolveDebugInfo @ react-server-dom-webpack-client.browser.development.js:2063
processFullStringRow @ react-server-dom-webpack-client.browser.development.js:2261
processFullBinaryRow @ react-server-dom-webpack-client.browser.development.js:2233
progress @ react-server-dom-webpack-client.browser.development.js:2479
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:1587
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:2396
exports.createFromReadableStream @ react-server-dom-webpack-client.browser.development.js:2717
eval @ app-index.js:132
(app-pages-browser)/./node_modules/next/dist/client/app-index.js @ main-app.js?v=1753632389581:160
options.factory @ webpack.js?v=1753632389581:712
__webpack_require__ @ webpack.js?v=1753632389581:37
fn @ webpack.js?v=1753632389581:369
eval @ app-next-dev.js:11
eval @ app-bootstrap.js:62
loadScriptsInSequence @ app-bootstrap.js:23
appBootstrap @ app-bootstrap.js:56
eval @ app-next-dev.js:10
(app-pages-browser)/./node_modules/next/dist/client/app-next-dev.js @ main-app.js?v=1753632389581:182
options.factory @ webpack.js?v=1753632389581:712
__webpack_require__ @ webpack.js?v=1753632389581:37
__webpack_exec__ @ main-app.js?v=1753632389581:2824
(anonymous) @ main-app.js?v=1753632389581:2825
webpackJsonpCallback @ webpack.js?v=1753632389581:1388
(anonymous) @ main-app.js?v=1753632389581:9Understand this error
header.tsx:178 <a> cannot contain a nested <a>.
See this log for the ancestor stack trace.