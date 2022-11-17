import React from 'react'
import { Container } from '@chakra-ui/react'
export const Section = ({ children, maxW }) => {
  return (
    <Container maxW={maxW || 'container.lg'} my="120px">
      {children}
    </Container>
  )
}
