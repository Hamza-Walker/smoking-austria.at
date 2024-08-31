'use client'

// eslint-disable-next-line simple-import-sort/imports
import { Gutter } from '../../Gutter'
import { Header } from '../../../../payload/payload-types'
import { HeaderNav } from '../Nav'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import classes from './index.module.scss'
import { noHeaderFooterUrls } from '../../../constants'
import { usePathname } from 'next/navigation'
import logo from '../../../../../public/smoking-logo.svg'
const HeaderComponent = ({ header }: { header: Header }) => {
  const pathname = usePathname()

  return (
    <>
      <nav
        className={[classes.header, noHeaderFooterUrls.includes(pathname) && classes.hide]
          .filter(Boolean)
          .join(' ')}
      >
        <Gutter className={classes.wrap}>
          <Link href="/">
            <Image src={logo} alt="Logo" width={170} height={20} className={classes.logo} />
          </Link>

          <HeaderNav header={header} />
        </Gutter>
      </nav>
    </>
  )
}
export default HeaderComponent
