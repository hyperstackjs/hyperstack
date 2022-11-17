module.exports = require('stylomatic/jest-node')
module.exports.testRegex = 'src/test/.*\\.(test|spec)\\.tsx?$'
module.exports.setupFilesAfterEnv = ['./testSetup.ts']
module.exports.moduleNameMapper = {
  '^@/(.*)$': '<rootDir>/src/$1',
}
