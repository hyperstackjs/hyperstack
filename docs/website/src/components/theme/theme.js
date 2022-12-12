import { extendTheme } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

const docsSidebarsBg = '#574538'

// 2. Call `extendTheme` and pass your custom values
const theme = extendTheme({
  fonts: {
    heading: "'Jost', sans-serif",
    body: "'Inter var', sans-serif",
  },
  styles: {
    global: {
      body: {
        fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
        background: 't_background',
        color: 't_text',
      },
      h1: { letterSpacing: '-0.03em', color: 't_text' },
      h2: { letterSpacing: '-0.03em', color: 't_text' },
      h3: { letterSpacing: '-0.02em', color: 't_text' },
      svg: {
        display: 'inline',
      },
    },
  },
  sizes: {
    max: '100%',
    container: {
      xl2: '1440px',
    },
  },
  colors: {
    brand: {
      50: '#FEF5FF',
      100: '#FDE5FF',
      200: '#FCD1FF',
      300: '#F9ADFF',
      400: '#F68FFF',
      500: '#F366FF',
      600: '#F361FF',
      700: '#EE24FF',
      800: '#DD00F0',
      900: '#A000AD',
    },
    charcoal: '#1b1b1d',
    canvas: '#FBF9FB',
    outline: 'blue',
    text: '#1B082B',
    textLighter: '#2A0746',
    textLightest: '#471470',
    textDarker: '#1B082B',
    textDocs: '#1B082B',
  },
  semanticTokens: {
    colors: {
      t_border_color: {
        default: 'blackAlpha.50',
        _dark: 'whiteAlpha.300',
      },
      t_strong: {
        default: 'textDarker',
        _dark: 'whiteAlpha.900',
      },
      t_text_docs: {
        default: 'textDocs',
        _dark: 'whiteAlpha.800',
      },
      t_text: {
        default: 'text',
        _dark: 'whiteAlpha.800',
      },
      t_weak: {
        default: 'textLighter',
        _dark: 'whiteAlpha.800',
      },
      t_weakest: {
        default: 'textLightest',
        _dark: 'whiteAlpha.800',
      },
      t_background: {
        default: 'canvas',
        _dark: 'charcoal',
      },
      t_background_docs: {
        default: 'canvas',
        _dark: 'charcoal',
      },
      t_background_article: {
        default: 'white',
        _dark: 'charcoal',
      },
      ink: {
        default: 'text',
        _dark: 'canvas',
      },
      inverseInk: {
        default: 'canvas',
        _dark: 'text',
      },
    },
  },
  shadows: {
    outline: '0 0 0 3px #FB309Aca',
  },
  components: {
    Link: {
      baseStyle: {
        color: 'brand.500',
        transition: 'color 200ms',
        _hover: {
          color: 'brand.500',
        },
        _focus: {
          boxShadow: 'none',
        },
      },
    },
    Code: {
      variants: {
        installer: (props) => ({
          border: 'none',
          background: 'none',
          color: mode('black', 'white')(props),
          fontSize: 16,
        }),
      },
    },
    Button: {
      sizes: {
        xl: {
          h: '60px',
          minW: 16,
          fontSize: 'md',
          px: 7,
        },
      },
      variants: {
        outline: {
          borderWidth: '2px',
          _hover: {
            textDecoration: 'none',
          },
        },
        'clipboard-copy': (props) => ({
          bg: 'ink',
          color: 'inverseInk',
          _focus: {
            shadow: 'none',
          },
          _hover: {
            bg: mode('blackAlpha.700', 'whiteAlpha.900')(props),
          },
          _active: {
            bg: mode('blackAlpha.800', 'whiteAlpha.800')(props),
          },
        }),
      },
    },
  },
})
console.log('theme', theme)
export default theme
