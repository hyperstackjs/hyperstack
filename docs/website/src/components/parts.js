import React from 'react'
import {
  Box,
  Heading,
  Img,
  Link,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
  HStack,
} from '@chakra-ui/react'

import controllersImg from '@site/static/img/part-controllers.png'
import workersImg from '@site/static/img/part-workers.png'
import modelsImg from '@site/static/img/part-models.png'
import testingImg from '@site/static/img/part-testing.png'

const PARTS = [
  {
    img: modelsImg,
    title: 'Hypermodel for data',
    description:
      'A pragmatic wrapper over sequelize with Typescript support, utilities, and best practices.',
    href: '/docs/the-app/models',
    bullets: [
      "Use Typescript decorators to define schema",
      "Bring in your own Sequelize logic",
      "Migrate and seed automatic or manual",
    ]
  },
  {
    img: controllersImg,
    title: 'Hypercontroller for API',
    description:
      'A decorator-based API building framework, secure, flexible and scalable on top of Express.',
    href: '/docs/the-app/controllers',
    bullets: [
      "Use Typescript decorators to define APIs",
      "Get security, strongparams & best practices",
      "Minimum boilerplate, automatic routing",
    ]
  },
  {
    img: workersImg,
    title: 'Hyperworker for jobs',
    description:
      'Powered by bull, a Rails-esque activejob clone with great developer experience.',
    href: '/docs/the-app/workers',
    bullets: [
      "Perform jobs and send emails",
      "Forget about the mechanics of queues",
      "Run in-process or standalone",
    ]
  },
  {
    img: testingImg,
    title: 'Amazing testing experience',
    description:
      'Minimal effort for testing requests, models, and jobs. Spend minimum energy with snapshots.',
    href: '/docs/digging-deeper/testing',
    bullets: [
      "Use built-in test kits to save setup",
      "Match results, redact sensitive data",
      "Use snapshots to save time",
    ]
  },
]

import CheckmarkLight from '../../static/img/checkmark-light.svg'
import CheckmarkDark from '../../static/img/checkmark-dark.svg'

const Checkmark = ()=>
      <Box sx={{ my: 0 }}>{useColorModeValue(<CheckmarkLight />, <CheckmarkDark />)}</Box>

const Part = ({ title, img, description, href, bullets }) => (
  <VStack spacing={3} mb={12}>
      <Box mb={6} shadow="2xl" borderRadius="2xl" sx={{ overflow: 'hidden' }}>
        <Img src={img} />
      </Box>
    <Heading as="h3" fontSize="2xl">
      {title}
    </Heading>
    <Text
      fontSize="lg"
      fontWeight={500}
      textAlign="center"
      letterSpacing="-0.02em"
    >
      {description}
    </Text>
    <Box sx={{py: 5}}>
      {bullets && bullets.map(bullet => 
        <HStack>
          <Checkmark/>
          <Text 
            fontSize="lg"
            fontWeight={400}
            textAlign="center"
            letterSpacing="-0.02em"
            pb="5px"
          >
            {bullet}
          </Text>
        </HStack>
      )}
    </Box>
    <Link href={href} sx={{}}>
      Learn more &rarr;
    </Link>
  </VStack>
)

export const Parts = ({ parts = PARTS }) => (
  <SimpleGrid px="12px" columns={[1, 1, 2]} spacing={10}>
    {parts.map((p) => (
      <Part key={p.title} {...p} />
    ))}
  </SimpleGrid>
)
