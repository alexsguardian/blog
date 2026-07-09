import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';
import type { RehypePlugin, RemarkPlugin } from '@astrojs/markdown-remark';
import { isInternalLink, externalLinkRel } from './links';

export const readingTimeRemarkPlugin: RemarkPlugin = () => {
  return function (tree, file) {
    const textOnPage = toString(tree);
    const readingTime = Math.ceil(getReadingTime(textOnPage).minutes);

    if (typeof file?.data?.astro?.frontmatter !== 'undefined') {
      file.data.astro.frontmatter.readingTime = readingTime;
    }
  };
};

export const responsiveTablesRehypePlugin: RehypePlugin = () => {
  return function (tree) {
    if (!tree.children) return;

    for (let i = 0; i < tree.children.length; i++) {
      const child = tree.children[i];

      if (child.type === 'element' && child.tagName === 'table') {
        tree.children[i] = {
          type: 'element',
          tagName: 'div',
          properties: {
            style: 'overflow:auto',
          },
          children: [child],
        };

        i++;
      }
    }
  };
};

export const lazyImagesRehypePlugin: RehypePlugin = () => {
  return function (tree) {
    if (!tree.children) return;

    visit(tree, 'element', function (node) {
      if (node.tagName === 'img') {
        node.properties.loading = 'lazy';
      }
    });
  };
};

// MDX parses raw `<a>` HTML tags in post content as mdxJsxTextElement/mdxJsxFlowElement
// nodes (attributes array), not plain hast `element` nodes (properties object) like
// markdown-native `[text](url)` links get. Need to handle both shapes.
type MdxJsxAttribute = { type: 'mdxJsxAttribute'; name: string; value: string | null };

const isMdxAnchor = (node: any): boolean =>
  (node.type === 'mdxJsxTextElement' || node.type === 'mdxJsxFlowElement') && node.name === 'a';

const getMdxAttr = (node: any, name: string): string | undefined =>
  node.attributes?.find((attr: MdxJsxAttribute) => attr.type === 'mdxJsxAttribute' && attr.name === name)?.value ?? undefined;

const setMdxAttr = (node: any, name: string, value: string) => {
  const existing = node.attributes?.find((attr: MdxJsxAttribute) => attr.type === 'mdxJsxAttribute' && attr.name === name);
  if (existing) {
    existing.value = value;
  } else {
    node.attributes.push({ type: 'mdxJsxAttribute', name, value });
  }
};

export const externalLinksRehypePlugin: RehypePlugin = () => {
  return function (tree) {
    if (!tree.children) return;

    visit(tree, function (node: any) {
      const isHastAnchor = node.type === 'element' && node.tagName === 'a';
      if (!isHastAnchor && !isMdxAnchor(node)) return;

      const href = isHastAnchor ? node.properties?.href : getMdxAttr(node, 'href');
      if (!href || isInternalLink(String(href)) || !/^https?:\/\//i.test(String(href))) return;

      const rel = externalLinkRel(String(href));

      if (isHastAnchor) {
        node.properties.target = '_blank';
        node.properties.rel = rel;
      } else {
        setMdxAttr(node, 'target', '_blank');
        setMdxAttr(node, 'rel', rel);
      }
    });
  };
};
