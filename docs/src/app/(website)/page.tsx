import * as React from 'react';
import type { Metadata, Viewport } from 'next';
import { Link } from 'docs/src/components/Link';

export default function Homepage() {
  return (
    <React.Fragment>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Base UI Chat',
            url: 'https://base-ui.com',
          }),
        }}
      />

      <section className="bui-d-c">
        <h1 className="Text sz-3 bp2:sz-4 bui-gcs-1 bui-gce-9 bp4:bui-gce-5">
          Headless chat UI components for building AI-powered interfaces
        </h1>
        <div className="bui-gcs-1 bui-gce-9">
          <Link className="Text sz-2 bui-d-if" href="/react/components/chat" withArrow>
            Documentation
          </Link>
        </div>
      </section>
      <section className="bui-d-c">
        <div className="bui-d-f bui-fd-c bui-g-4 bui-gcs-1 bui-gce-9 bp2:bui-gcs-3 bp4:bui-gce-7">
          <p className="Text sz-2">
            Base&nbsp;UI Chat is a headless component library for building AI chat interfaces with
            React. It provides the structure, state management, and accessibility of a chat UI
            without imposing any visual design.
          </p>
          <p className="Text sz-2">
            Stream responses from any AI provider, render rich message content with Markdown and
            tool outputs, manage conversation history, and handle errors — all with full control
            over your markup and styles.
          </p>
          <p className="Text sz-2">
            Built on top of{' '}
            <Link href="https://base-ui.com">Base UI</Link>, it follows the same philosophy:
            composable, accessible, and unstyled by default. Use Tailwind, CSS Modules, plain CSS,
            or any other styling solution you prefer.
          </p>
        </div>
      </section>
    </React.Fragment>
  );
}

const description =
  'Headless chat UI components for building AI-powered interfaces with React.';

export const metadata: Metadata = {
  description,
  twitter: {
    site: '@base_ui',
    card: 'summary_large_image',
    description,
  },
  openGraph: {
    type: 'website',
    url: './',
    description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    {
      media: '(prefers-color-scheme: light) and (min-width: 1024px)',
      color: 'oklch(95% 0.25% 264)',
    },
    {
      media: '(prefers-color-scheme: dark) and (min-width: 1024px)',
      color: 'oklch(25% 1% 264)',
    },
    {
      media: '(prefers-color-scheme: light)',
      color: '#FFF',
    },
    {
      media: '(prefers-color-scheme: dark)',
      color: '#000',
    },
  ],
};
