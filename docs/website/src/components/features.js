import React from 'react'
import { SimpleGrid, Text, VStack } from '@chakra-ui/react'

const FEATURES = [
  {
    title: '🚦Test driven everything',
    description:
      'Test your app with very little effort. Models, controllers, background jobs and more. Ship fast with confidence.',
  },
  {
    title: '🔋 Batteries included',
    description:
      'App-first thinking. Service, data, emails, background jobs, tasks, CLI to drive it, everything is included.',
  },
  {
    title: '🔮 Rails is great',
    description:
      'Hyperstack follows Rails. There, I said it. Rails concepts are carefully adapted to modern Node development.',
  },
  {
    title: '🏅 Deliver with confidence',
    description:
      'Unapologetically optimized for the solo developer. Complexity and heavylifting is tucked away.',
  },
  {
    title: '⚡️ Scale when needed',
    description:
      'Split, reconfigure, or use only parts of Hyperstack when you need to. Build and grow without pain.',
  },
  {
    title: '🚀️ Build incrementally',
    description:
      'If you want to migrate from an Express or Sequelize app, hyperstack is compatible with most of your existing code.',
  },
]

const Feature = ({ title, description }) => (
  <VStack
    flexDirection="column"
    spacing={4}
    alignItems={['center', 'center', 'flex-start']}
  >
    <Text as="h3" fontSize="2xl" fontWeight={600}>
      {title}
    </Text>
    <Text letterSpacing="-0.03em" fontWeight={400}>
      {description}
    </Text>
  </VStack>
)

export const Features = ({ features = FEATURES }) => {
  return (
    <SimpleGrid columns={[1, 1, 3]} spacing="60px">
      {features.map((f) => (
        <Feature key={f.title} {...f} />
      ))}
    </SimpleGrid>
  )
}
