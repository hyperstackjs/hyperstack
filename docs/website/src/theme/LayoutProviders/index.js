// docusaurus(J): add sync color mode to sync colors
import React from 'react'
import LayoutProviders from '@theme-original/LayoutProviders'
import { Theme } from '../../components/theme'
import { SyncColorMode } from '../../utils/useSyncColorMode'

export default function LayoutProvidersWrapper({ children, ...props }) {
  return (
    <>
      <LayoutProviders {...props}>
        <Theme>
          <SyncColorMode />
          {children}
        </Theme>
      </LayoutProviders>
    </>
  )
}
