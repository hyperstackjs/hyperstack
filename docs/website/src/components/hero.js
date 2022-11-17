import React from 'react'
import {
  Box,
  Button,
  Code,
  Flex,
  Heading,
  Link,
  Text,
  useClipboard,
  useColorModeValue,
} from '@chakra-ui/react'
import Logo from '../../static/img/rocky.svg'
import LogoDark from '../../static/img/rocky-dark.svg'

const CopyCmd = ({ cmd }) => {
  const clipboard = useClipboard(cmd)
  return (
    <Flex
      sx={{
        border: '2px solid',
        borderColor: 'ink',
        padding: 3,
        borderRadius: 'lg',
      }}
    >
      <Flex flex="1" flexDirection="row" alignItems="center">
        <Code variant="installer">{`$ ${cmd}`}</Code>
      </Flex>
      <Button
        onClick={clipboard.onCopy}
        sx={{
          ml: 2,
          textTransform: 'uppercase',
          fontSize: 'xs',
          lineHeight: 'inherit',
          width: '4rem',
        }}
        size="sm"
        variant="clipboard-copy"
        colorScheme="blackAlpha"
      >
        {clipboard.hasCopied ? '🎉🚀🤘' : 'Copy'}
      </Button>
    </Flex>
  )
}

const Installer = () => {
  return (
    <Flex flexDirection={['column', 'column', 'row']}>
      <CopyCmd cmd="pnpm create hyperstack my-app" />
      <Box sx={{ p: 2 }}></Box>
      <Button
        as={Link}
        href="/docs/getting-started"
        colorScheme="brand"
        variant="outline"
        size="xl"
      >
        Get Started
      </Button>
    </Flex>
  )
}
export const Hero = () => {
  return (
    <Flex flexDirection="column" alignItems="center">
      <Box sx={{ my: 0 }}>{useColorModeValue(<Logo />, <LogoDark />)}</Box>
      <Heading
        sx={{ mb: 4 }}
        as="h1"
        size="2xl"
        fontWeight={500}
        letterSpacing={-3}
      >
        Build more side projects, ship more products
      </Heading>
      <Text
        sx={{ mb: 10, fontWeight: 400 }}
        color="t_weak"
        as="h2"
        fontSize="xl"
        fontFamily="Inter var"
        letterSpacing={-1}
      >
        Hyperstack is a modern Node.js web framework for the pragmatic programmer
      </Text>
      <Installer />
    </Flex>
  )
}
