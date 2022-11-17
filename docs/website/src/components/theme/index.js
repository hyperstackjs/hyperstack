/* eslint-disable react/prop-types */
import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import theme from './theme'
import ResetCSS from './reset-css'

export const Theme = ({ children }) => {
  return (
    <ChakraProvider theme={theme} resetCSS={false}>
      <ResetCSS />
      {children}
    </ChakraProvider>
  )
}
