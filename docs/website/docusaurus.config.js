// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/nightOwlLight')
const darkCodeTheme = require('prism-react-renderer/themes/dracula')
const metaDescription =
  'A Node.js web framework that has everything included for building your next startup, side project, and modern API services.'
const tagline =
  'Hyperstack is a modern full-stack Node.js web framework for the pragmatic programmer '
const absoluteImg = 'https://hyperstackjs.io/img/logo@4x.png'

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'hyperstackjs',
  tagline,
  url: 'https://hyperstackjs.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.svg',

  stylesheets: [
    'https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap',
  ],

  organizationName: 'jondot',
  projectName: 'hyperstack',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        theme: {
          customCss: require.resolve('./src/components/theme/custom.css'),
        },
        gtag: {
          trackingID: 'G-P3HXDS9S55',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        {
          name: 'description',
          content: metaDescription,
        },
        { name: 'og:site_name', content: 'Hyperstackjs' },
        { name: 'og:type', content: 'website' },
        {
          name: 'og:description',
          content: tagline,
        },
        {
          name: 'og:image',
          content: absoluteImg,
        },
        {
          name: 'og:image:url',
          content: absoluteImg,
        },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:site', content: '@gethyperstack' },
        {
          name: 'twitter:image',
          content: absoluteImg,
        },
        {
          name: 'twitter:description',
          content: tagline,
        },
      ],
      image: absoluteImg,
      navbar: {
        hideOnScroll: true,
        logo: {
          alt: 'Hyperstack',
          src: 'img/logo-hz-light.svg',
          srcDark: 'img/logo-hz-dark.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'getting-started/index',
            position: 'right',
            label: 'Docs',
          },
          {
            href: 'https://github.com/hyperstackjs/hyperstack',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        logo: {
          alt: 'hyperstack',
          src: 'img/logo-stacked-light.svg',
          srcDark: 'img/logo-stacked-dark.svg',
        },
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Get Started',
                to: '/docs/getting-started',
              },
              {
                label: 'Building APIs',
                to: '/docs/the-app/controllers',
              },
              {
                label: 'Modeling Data',
                to: '/docs/the-app/models',
              },
              {
                label: 'Background Jobs',
                to: '/docs/the-app/workers',
              },
              {
                label: 'Testing',
                to: '/docs/digging-deeper/testing',
              },
              {
                label: 'Deployment',
                to: '/docs/getting-started/deploying',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/hyperstackjs',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/jondot',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/hyperstackjs/hyperstack',
              },
            ],
          },
        ],
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexBlog: false,
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],
}

module.exports = config
