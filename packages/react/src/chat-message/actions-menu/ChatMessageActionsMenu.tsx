'use client';
import * as React from 'react';
import { Menu } from '@base-ui/react/menu';

/**
 * The root of a message action menu. Wraps Base UI `Menu.Root`.
 * Does not render an HTML element itself.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export function ChatMessageActionsMenuRoot(props: Menu.Root.Props) {
  return <Menu.Root {...props} />;
}

/**
 * A button that opens the message action menu. Wraps Base UI `Menu.Trigger`.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatMessageActionsMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  Menu.Trigger.Props
>(function ChatMessageActionsMenuTrigger(props, ref) {
  return <Menu.Trigger {...props} ref={ref} />;
});

/**
 * Positions the message action menu popup. Wraps Base UI `Menu.Positioner`.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatMessageActionsMenuPositioner = React.forwardRef<
  HTMLDivElement,
  Menu.Positioner.Props
>(function ChatMessageActionsMenuPositioner(props, ref) {
  return <Menu.Positioner {...props} ref={ref} />;
});

/**
 * The popup element containing the menu items. Wraps Base UI `Menu.Popup`.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatMessageActionsMenuPopup = React.forwardRef<HTMLDivElement, Menu.Popup.Props>(
  function ChatMessageActionsMenuPopup(props, ref) {
    return <Menu.Popup {...props} ref={ref} />;
  },
);

/**
 * A group of related menu items. Wraps Base UI `Menu.Group`.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatMessageActionsMenuGroup = React.forwardRef<HTMLDivElement, Menu.Group.Props>(
  function ChatMessageActionsMenuGroup(props, ref) {
    return <Menu.Group {...props} ref={ref} />;
  },
);

/**
 * A label for a group of menu items. Wraps Base UI `Menu.GroupLabel`.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatMessageActionsMenuGroupLabel = React.forwardRef<
  HTMLDivElement,
  Menu.GroupLabel.Props
>(function ChatMessageActionsMenuGroupLabel(props, ref) {
  return <Menu.GroupLabel {...props} ref={ref} />;
});

/**
 * A menu item in the message action menu. Wraps Base UI `Menu.Item`.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatMessageActionsMenuItem = React.forwardRef<HTMLDivElement, Menu.Item.Props>(
  function ChatMessageActionsMenuItem(props, ref) {
    return <Menu.Item {...props} ref={ref} />;
  },
);

export const ChatMessageActionsMenu = {
  Root: ChatMessageActionsMenuRoot,
  Trigger: ChatMessageActionsMenuTrigger,
  Positioner: ChatMessageActionsMenuPositioner,
  Popup: ChatMessageActionsMenuPopup,
  Group: ChatMessageActionsMenuGroup,
  GroupLabel: ChatMessageActionsMenuGroupLabel,
  Item: ChatMessageActionsMenuItem,
};
