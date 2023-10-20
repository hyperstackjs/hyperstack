import * as matchers from 'jest-extended'
import 'email-templates'
expect.extend(matchers) // this is to avoid lazy loading and speed up tests
