import React from 'react'
import { Box, Flex, Heading, Text } from '@chakra-ui/react'
import useBaseUrl from '@docusaurus/useBaseUrl'

export const Player = () => (
  <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
    <Heading
      sx={{ mb: 4 }}
      as="h1"
      size="2xl"
      fontWeight={500}
      letterSpacing={-3}
    >
      All the stuff you need, in one place
    </Heading>
    <Text
      sx={{ mb: 16, fontWeight: 400 }}
      color="t_weak"
      as="h2"
      fontSize="xl"
      fontFamily="Inter var"
      letterSpacing={-1}
    >
      Get in the zone, stay in the zone, and ship software.
    </Text>
    <Box
      sx={{
        shadow: 'sm',
        borderRadius: 'md',
        overflow: 'hidden',
        height: '540px',
      }}
    >
      <video
        sx={{ width: '100%' }}
        autoPlay="no"
        playsInline
        controls
        src={useBaseUrl(`intro.mp4`)}
      />
    </Box>
  </Flex>
)
