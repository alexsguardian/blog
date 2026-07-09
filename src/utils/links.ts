// Substrings unique to known affiliate/sponsored links across the site (about page + posts).
// Matched links get rel="sponsored" per Google's guidance for paid/monetized links.
const AFFILIATE_LINK_MARKERS = [
  '67f6812cc5712674183021660b122e45095f35b5', // Linode referral code
  'privateinternetaccess.com/pages/buy-a-vpn/1218buyavpn?invite=',
  'vessi.com/pages/friend-signup?ref=',
  'app.invoicing.co/#/register?rc=',
  'paypal.me/alexandzors',
  'kraken.com/pay/alexandzors',
  'github.com/sponsors/alexandzors',
  'referworkspace.app.goo.gl',
];

export const isAffiliateLink = (href: string): boolean => AFFILIATE_LINK_MARKERS.some((marker) => href.includes(marker));

export const isInternalLink = (href: string): boolean =>
  href.startsWith('/') ||
  href.startsWith('#') ||
  href.startsWith('mailto:') ||
  href.startsWith('tel:') ||
  href.includes('blog.alexsguardian.net');

export const externalLinkRel = (href: string): string => (isAffiliateLink(href) ? 'sponsored noopener noreferrer' : 'noopener noreferrer');
