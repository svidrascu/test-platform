var config = require('./config.global')
config.env = 'test'

config.reporting.service = process.env.REPORTING_URL || 'http://localhost:3000'
module.exports = config
