import * as React from 'react';
import { Menu } from '@base-ui/chat/menu';
import type {
  MenuRootActions,
  MenuRootChangeEventDetails,
  MenuRootChangeEventReason,
  SimpleMenuProps,
} from './menu';

export const SimpleMenu = React.forwardRef<HTMLButtonElement, SimpleMenuProps>(function SimpleMenu(
  { label = 'Menu', ...rest },
  ref,
) {
  const actionsRef = React.useRef<MenuRootActions>(null);

  function handleMenuOpenChange(
    open: boolean,
    details: MenuRootChangeEventDetails,
  ): MenuRootChangeEventReason | undefined {
    if (details.reason === 'trigger-hover') {
      return details.reason;
    }
    return undefined;
  }

  return (
    <Menu.Root {...rest} actionsRef={actionsRef} onOpenChange={handleMenuOpenChange}>
      <Menu.Trigger ref={ref}>{label}</Menu.Trigger>
      <Menu.Positioner>
        <Menu.Popup>
          <Menu.Item>Item 1</Menu.Item>
          <Menu.Item>Item 2</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Root>
  );
});
