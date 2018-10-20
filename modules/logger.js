const bunyan = require('bunyan')
const bunyanDebugStream = require('bunyan-debug-stream')

module.exports = () => {
  return bunyan.createLogger({
    name: 'requarks.io',
    streams: [{
      level: 'info',
      type: 'raw',
      stream: bunyanDebugStream({
        basepath: process.cwd(),
        forceColor: true
      })
    }],
    serializers: bunyanDebugStream.serializers
  })
}
