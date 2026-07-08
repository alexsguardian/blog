import { SITE, METADATA, APP_BLOG } from 'astrowind:config';
import { fetchPosts } from '~/utils/blog';
import { getCanonical, getPermalink } from '~/utils/permalinks';

export const GET = async () => {
  if (!APP_BLOG.isEnabled) {
    return new Response(null, {
      status: 404,
      statusText: 'Not found',
    });
  }

  const posts = await fetchPosts();

  const lines = [
    `# ${SITE.name}`,
    '',
    METADATA?.description || '',
    '',
    '## Posts',
    '',
    ...posts.map((post) => `- [${post.title}](${getCanonical(getPermalink(post.permalink, 'post'))}): ${post.excerpt || ''}`),
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
