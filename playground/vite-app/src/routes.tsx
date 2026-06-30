import type * as React from 'react';
import RadixTriggers from './experiments/perf/radix-triggers';

export type RouteEntry =
  | {
      type: 'route';
      path: string;
      label: string;
      element: React.ReactElement;
      showInNav?: boolean;
    }
  | {
      type: 'redirect';
      path: string;
      to: string;
    }
  | {
      type: 'header';
      label: string;
    };

export const defaultRoute = '/perf/radix-triggers';

export const routes: RouteEntry[] = [
  { type: 'header', label: 'Performance benchmarks' },
  { type: 'redirect', path: '/perf', to: defaultRoute },
  {
    type: 'route',
    path: '/perf/radix-triggers',
    label: 'Radix triggers',
    element: <RadixTriggers />,
    showInNav: true,
  },
];
