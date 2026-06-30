'use client';
import * as React from 'react';
import { HTMLProps } from '../../internals/types';
import { MenuStore } from '../store/MenuStore';
import { REASONS } from '../../internals/reasons';
import type { UseMenuItemMetadata } from './useMenuItem';

export interface UseMenuItemCommonPropsParameters {
  /**
   * Whether to close the menu when the item is clicked.
   */
  closeOnClick: boolean;
  /**
   * Determines if the menu item is highlighted.
   */
  highlighted: boolean;
  /**
   * The id of the menu item.
   */
  id: string | undefined;
  /**
   * The node id of the menu positioner.
   */
  nodeId: string | undefined;
  /**
   * The menu store.
   */
  store: MenuStore<any>;
  /**
   * Whether a typeahead session is in progress.
   */
  typingRef?: React.RefObject<boolean> | undefined;
  /**
   * Ref to the item element.
   */
  itemRef: React.RefObject<HTMLElement | null>;
  /**
   * Optional metadata for checking item type before triggering click.
   * If provided, click will only be triggered for 'regular-item' type.
   */
  itemMetadata?: UseMenuItemMetadata | undefined;
}

/**
 * Returns common props shared by all menu item types.
 * This hook extracts the shared logic for id, role, tabIndex, onKeyDown,
 * onMouseMove, onClick, and onMouseUp handlers.
 */
export function useMenuItemCommonProps(params: UseMenuItemCommonPropsParameters): HTMLProps {
  const { closeOnClick, highlighted, id, nodeId, store, typingRef, itemRef, itemMetadata } = params;

  const { events: menuEvents } = store.useState('floatingTreeRoot');
  const open = store.useState('open');
  return React.useMemo(
    () => ({
      id,
      role: 'menuitem' as const,
      tabIndex: open && highlighted ? 0 : -1,
      onKeyDown(event: React.KeyboardEvent) {
        if (event.key === ' ' && typingRef?.current) {
          event.preventDefault();
        }
      },
      onMouseMove(event: React.MouseEvent) {
        if (!nodeId) {
          return;
        }

        // Inform the floating tree that a menu item within this menu was hovered/moved over
        // so unrelated descendant submenus can be closed.
        menuEvents.emit('itemhover', {
          nodeId,
          target: event.currentTarget,
        });
      },
      onClick(event: React.MouseEvent) {
        if (closeOnClick) {
          menuEvents.emit('close', { domEvent: event, reason: REASONS.itemPress });
        }
      },
      onMouseUp(_event: React.MouseEvent) {
        if (itemRef.current && store.context.allowMouseUpTriggerRef.current) {
          if (!itemMetadata || itemMetadata.type === 'regular-item') {
            itemRef.current.click();
          }
        }
      },
    }),
    [
      closeOnClick,
      highlighted,
      id,
      menuEvents,
      nodeId,
      open,
      store,
      typingRef,
      itemRef,
      itemMetadata,
    ],
  );
}

export interface UseMenuItemCommonPropsState {}
