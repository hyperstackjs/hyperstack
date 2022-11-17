import React from 'react'
import { useColorMode } from '@chakra-ui/react'
import { useColorMode as useDocuColorMode } from '@docusaurus/theme-common'

export const SyncColorMode = () => {
  const { colorMode: docuColorMode } = useDocuColorMode()
  const { colorMode, toggleColorMode } = useColorMode()
  if (docuColorMode !== colorMode) {
    toggleColorMode()
  }
  return <></>
}
