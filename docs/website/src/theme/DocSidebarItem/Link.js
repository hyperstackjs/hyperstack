// docusaurus(J): change behavior w.r.t styling + css changes

import React from 'react'
import clsx from 'clsx'
import { ThemeClassNames, isActiveSidebarItem } from '@docusaurus/theme-common'
import Link from '@docusaurus/Link'
import isInternalUrl from '@docusaurus/isInternalUrl'
import IconExternalLink from '@theme/IconExternalLink'
import styles from './Link.module.css'
export default function DocSidebarItemLink({
  item,
  onItemClick,
  activePath,
  level,
  index,
  ...props
}) {
  const { href, label, className } = item
  const isActive = isActiveSidebarItem(item, activePath)
  const isInternalLink = isInternalUrl(href)
  return (
    <li
      className={clsx(
        ThemeClassNames.docs.docSidebarItemLink,
        ThemeClassNames.docs.docSidebarItemLinkLevel(level),
        'menu__list-item',
        className,
        styles.link
      )}
      key={label}
    >
      <div className={clsx(level > 1 ? styles.bullet : styles.bulletTop)}>
        {level === 1 && '•'}
      </div>
      <Link
        className={clsx(
          'menu__link',
          !isInternalLink && styles.menuExternalLink,
          {
            'menu__link--active': isActive,
          }
        )}
        aria-current={isActive ? 'page' : undefined}
        to={href}
        {...(isInternalLink && {
          onClick: onItemClick ? () => onItemClick(item) : undefined,
        })}
        {...props}
      >
        {label}
        {!isInternalLink && <IconExternalLink />}
      </Link>
    </li>
  )
}
