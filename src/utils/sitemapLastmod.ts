import fs from 'node:fs';
import path from 'node:path';
import slugify from 'limax';
import { slug as githubSlug } from 'github-slugger';
import loadConfig from '../../vendor/integration/utils/loadConfig';

const POSTS_DIR = path.resolve(process.cwd(), 'src/data/posts');

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === 'drafts' ? [] : walk(fullPath);
    }
    return /\.(md|mdx)$/.test(entry.name) ? [fullPath] : [];
  });

// Mirrors Astro's content-collection id generation (github-slugger per segment,
// see astro/dist/content/utils.js getContentEntryIdAndSlug) followed by this repo's
// own cleanSlug (src/utils/permalinks.ts, limax per segment) applied to that id.
const cleanSlug = (text: string) =>
  text
    .split('/')
    .filter(Boolean)
    .map((segment) => slugify(githubSlug(segment)))
    .join('/');

/** Builds a URL pathname -> lastmod Date map for post pages, for use in @astrojs/sitemap's `serialize`. */
export const buildLastmodMap = async (): Promise<Record<string, Date>> => {
  const map: Record<string, Date> = {};

  if (!fs.existsSync(POSTS_DIR)) return map;

  const config = (await loadConfig('src/config.yaml')) as {
    apps?: { blog?: { post?: { permalink?: string } } };
  };
  const permalinkPattern = config?.apps?.blog?.post?.permalink || '/posts/%slug%';
  const [prefix] = permalinkPattern.split('%slug%');

  for (const file of walk(POSTS_DIR)) {
    const content = fs.readFileSync(file, 'utf8');
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatterMatch) continue;
    const frontmatter = frontmatterMatch[1];

    if (/^draft:\s*true\s*$/m.test(frontmatter)) continue;

    const relativePath = path
      .relative(POSTS_DIR, file)
      .replace(/\.(md|mdx)$/, '')
      .split(path.sep)
      .join('/');

    const [year, month, day] = relativePath.split('/');
    let lastmod = year && month && day ? new Date(`${year}-${month}-${day}T00:00:00Z`) : undefined;

    const updateDateMatch = frontmatter.match(/^updateDate:\s*(.+)$/m);
    if (updateDateMatch) {
      const parsed = new Date(updateDateMatch[1].trim().replace(/^['"]|['"]$/g, ''));
      if (!Number.isNaN(parsed.valueOf())) lastmod = parsed;
    }

    if (!lastmod) continue;

    const pathname = `${prefix}${cleanSlug(relativePath)}`.replace(/\/{2,}/g, '/');
    map[pathname] = lastmod;
  }

  return map;
};
