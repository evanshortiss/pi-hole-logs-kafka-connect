'use strict'

const pino = require('pino');
const { get } = require('env-var')

module.exports = {
  HTTP_PORT: get('HTTP_PORT').default('8080').asPortNumber(),
  LOG_LEVEL: get('LOG_LEVEL')
    .default('debug')
    .asEnum(Object.keys(pino.levels.values)),

  PIHOLE_LOGS_TOPIC_IN: 'pihole-dnsmasq-logs',
  PIHOLE_LOGS_TOPIC_OUT: 'pihole-dnsmasq-logs-json',

  KAKFAJS_CONFIG: {
    clientId: 'pihole-logs-parser',
    brokers: get('KAFKACONNECTION_BOOTSTRAPSERVERS').asArray(),
    ssl: get('KAFKACONNECTION_SSL').default('true').asBool(),
    sasl: {
      mechanism: 'plain',
      username: get('KAFKACONNECTION_USER').asString(),
      password: get('KAFKACONNECTION_PASSWORD').asString()
    }
  }
}
