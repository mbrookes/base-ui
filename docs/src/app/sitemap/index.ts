import { createSitemap } from '@mui/internal-docs-infra/createSitemap';
import Overview from '../(docs)/react/getting-started/page.mdx';
import Guides from '../(docs)/react/guides/page.mdx';
import Customization from '../(docs)/react/customization/page.mdx';
import Reference from '../(docs)/react/reference/page.mdx';

export const sitemap = createSitemap(import.meta.url, {
  Overview,
  Guides,
  Customization,
  Reference,
});
