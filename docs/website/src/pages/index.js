import React from 'react'
import Layout from '@theme/Layout'
import { Hero } from '../components/hero'
import { Features } from '../components/features'
import { Player } from '../components/player'
import { Parts } from '../components/parts'
import { Section } from '../components/section'

export default function Home() {
  return (
    <Layout>
      <Section>
        <Hero />
      </Section>
      <Section>
        <Features />
      </Section>
      <Section>
        <Player />
      </Section>
      <Section maxW="container.lg">
        <Parts />
      </Section>
    </Layout>
  )
}
