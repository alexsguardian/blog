import { getPermalink, getAsset } from './utils/permalinks';

import favicon from '~/assets/favicons/favicon.svg';

export const headerData = {
  links: [
    {
      text: 'Home',
      href: '/',
    },
    {
      text: 'Guides',
      href: getPermalink('/guides'),
    },
    {
      text: 'Categories',
      href: getPermalink('/categories'),
    },
    {
      text: 'Archives',
      href: getPermalink('/archives'),
    },
    {
      text: 'Tags',
      href: getPermalink('/tags'),
    },      
    {
      text: 'About',
      href: getPermalink('/about'),
    },
  ],
};

export const footerData = {
  socialLinks: [
    { ariaLabel: 'Bluesky', icon: 'tabler:brand-bluesky', href: 'https://bsky.app/profile/alexsguardian.net', brandcolor: '#4f9bd9'},
    { ariaLabel: 'GitHub', icon: 'tabler:brand-github', href: 'https://github.com/alexandzors', brandcolor: '#000'},
    { ariaLabel: 'LinkedIn', icon: 'tabler:brand-linkedin', href: 'https://www.linkedin.com/in/alexander-henderson-831959168/', brandcolor: '#0A66C2' },
    { ariaLabel: 'YouTube', icon: 'tabler:brand-youtube', href: 'https://www.youtube.com/@alexandzors', brandcolor: '#DB4437' },
    { ariaLabel: `Alex's Guardian`, icon: 'tabler:building', href: 'https://alexsguardian.net', brandcolor: '#6E06DF' },
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml'), brandcolor: '#ee802f' },
  ],
  footNote: `
    <img class="w-5 h-5 md:w-6 md:h-6 md:-mt-0.5 bg-cover mr-1.5 rtl:mr-0 rtl:ml-1.5 float-left rtl:float-right rounded-sm" src=${favicon.src} alt="Alex's Guardian Logo" loading="lazy"/>
    © 2025 - <a class="text-blue-600 underline dark:text-muted" href="https://github.com/alexandzors"> Alexander Henderson</a>. Some rights reserved. <span class="flex"> Powered by&nbsp;<a class="text-blue-600 underline dark:text-muted" href="https://github.com/onwidget/astrowind">Astrowind</a>&nbsp;🚀 </span>
  `,
};

export const authorSameAs = footerData.socialLinks
  .filter((link) => link.ariaLabel !== 'RSS')
  .map((link) => link.href);