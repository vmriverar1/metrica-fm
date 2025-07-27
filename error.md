n HTML, <a> cannot be a descendant of <a>.
This will cause a hydration error.

See more info here: https://nextjs.org/docs/messages/react-hydration-error


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
src/components/landing/header.tsx (180:30) @ <unknown>


  178 |                         <Link href={`#${item.id}`} passHref>
  179 |                            <NavigationMenuLink asChild>
> 180 |                              <a className={cn(navigationMenuTriggerStyle(), navLinkClasses)}>
      |                              ^
  181 |                                {item.label}
  182 |                              </a>
  183 |                            </NavigationMenuLink>