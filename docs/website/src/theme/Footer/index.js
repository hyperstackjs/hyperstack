// docusaurus(J): changed footer completely
import React from 'react'
import { useThemeConfig } from '@docusaurus/theme-common'
import FooterLogo from '@theme/Footer/Logo'
import FooterCopyright from '@theme/Footer/Copyright'
import {
  Box,
  Link as CLink,
  Container,
  Flex,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react'
import Link from '@docusaurus/Link'

function Footer() {
  const { footer } = useThemeConfig()

  if (!footer) {
    return null
  }

  const { copyright, links, logo } = footer
  return (
    <Box borderTop="1px solid" borderColor="t_border_color">
      <Container maxW="container.lg">
        <Flex sx={{ my: 10 }} flexDirection="column" alignItems="center">
          <Flex
            w="100%"
            flexDirection={['column', 'column', 'row']}
            alignItems={['center', 'center', 'flex-start']}
          >
            <Flex flex={1}>
              <VStack sx={{ mb: 6 }}>
                <Box sx={{ maxW: '100px' }}>
                  <FooterLogo logo={logo} />
                </Box>
              </VStack>
            </Flex>
            <HStack alignItems="flex-start" spacing="64px">
              {links &&
                links.length > 0 &&
                links.map(({ title, items }) => (
                  <VStack alignItems="flex-start" key={title}>
                    <Text fontWeight={600}>{title}</Text>
                    <VStack alignItems="flex-start">
                      {items.map(({ label, href, to }) => (
                        <CLink
                          as={Link}
                          sx={{ color: 'inherit' }}
                          key={href || to}
                          to={to}
                          href={href}
                        >
                          {label}
                        </CLink>
                      ))}
                    </VStack>
                  </VStack>
                ))}
            </HStack>
          </Flex>
          <Box sx={{ mt: 14 }}>
            {copyright && <FooterCopyright copyright={copyright} />}
          </Box>
        </Flex>
      </Container>
    </Box>
  )
}

export default React.memo(Footer)
