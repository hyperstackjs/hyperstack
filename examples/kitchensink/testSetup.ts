import * as matchers from 'jest-extended'
import 'email-templates' // this is to avoid lazy loading and speed up tests
expect.extend(matchers)
