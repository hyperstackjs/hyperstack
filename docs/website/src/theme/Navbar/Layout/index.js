// docusaurus(J): no change in js, change is in css, instead of hide -> shadow
import React from 'react'
import clsx from 'clsx'
import NavbarMobileSidebar from '@theme/Navbar/MobileSidebar'
import {
  useHideableNavbar,
  useNavbarMobileSidebar,
  useThemeConfig,
} from '@docusaurus/theme-common'
import styles from './styles.module.css'

function NavbarBackdrop(props) {
  return (
    <div
      role="presentation"
      {...props}
      className={clsx('navbar-sidebar__backdrop', props.className)}
    />
  )
}

export default function NavbarLayout({ children }) {
  const {
    navbar: { hideOnScroll, style },
  } = useThemeConfig()
  const mobileSidebar = useNavbarMobileSidebar()
  const { navbarRef, isNavbarVisible } = useHideableNavbar(hideOnScroll)
  return (
    <nav
      ref={navbarRef}
      className={clsx(
        'navbar',
        'navbar--fixed-top',
        hideOnScroll && [
          styles.navbarHideable,
          !isNavbarVisible && styles.navbarHidden,
        ],
        {
          'navbar--dark': style === 'dark',
          'navbar--primary': style === 'primary',
          'navbar-sidebar--show': mobileSidebar.shown,
        }
      )}
    >
      {children}
      <NavbarBackdrop onClick={mobileSidebar.toggle} />
      <NavbarMobileSidebar />
    </nav>
  )
}
