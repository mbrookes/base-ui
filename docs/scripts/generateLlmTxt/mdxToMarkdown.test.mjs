import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
// eslint-disable-next-line import/extensions
import { releases } from '../../src/data/releases.ts';
import { mdxToMarkdown } from './mdxToMarkdown.mjs';

describe('mdxToMarkdown', () => {
  // A snapshot test for the Chat MDX content.
  // Serves as an integration test for the markdown generation of component docs.
  it('should transform Chat MDX content to markdown with metadata', async () => {
    const chatMdxPath = path.resolve(
      import.meta.dirname,
      '../../src/app/(docs)/react/components/chat/page.mdx',
    );
    const chatMdxContent = fs.readFileSync(chatMdxPath, 'utf-8');

    const result = await mdxToMarkdown(chatMdxContent, chatMdxPath);

    expect(result).toBeTypeOf('object');
    expect(result).toHaveProperty('markdown');
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('subtitle');
    expect(result).toHaveProperty('description');

    expect(result.title).toBe('Chat');
    expect(result.subtitle).toBe('A set of headless components for building chat interfaces.');
    expect(result.description).toBe(
      'High-quality, unstyled React chat components for building conversational AI and messaging interfaces.',
    );

    expect(result.markdown).toMatchSnapshot();
  });

  it('should include all releases from releases.ts', async () => {
    const releasesMdxPath = path.resolve(
      import.meta.dirname,
      '../../src/app/(docs)/react/overview/releases/page.mdx',
    );
    const releasesMdxContent = fs.readFileSync(releasesMdxPath, 'utf-8');

    const urlPath = '/react/overview/releases';
    const urlsWithMdVersion = new Set([
      urlPath,
      ...releases.map((r) => `/react/overview/releases/${r.versionSlug}`),
    ]);
    const result = await mdxToMarkdown(releasesMdxContent, releasesMdxPath, {
      urlPath,
      urlsWithMdVersion,
    });

    // Strip markdown backslash escapes (e.g. \<) for content comparison
    const normalized = result.markdown.replace(/\\(.)/g, '$1');
    // Split into per-release sections so duplicate highlights are verified per release
    const sections = normalized.split(/(?=^### )/m);

    for (const release of releases) {
      const heading = `### [${release.version}](/react/overview/releases/${release.versionSlug}.md)`;
      expect(result.markdown).toContain(heading);

      const section = sections.find((s) => s.startsWith(heading));
      expect(section).toBeDefined();
      for (const highlight of release.highlights) {
        expect(section).toContain(`- ${highlight}`);
      }
    }
  });
});
