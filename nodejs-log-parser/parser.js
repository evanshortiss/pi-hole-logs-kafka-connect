'use strict'

const { getBinding } = require('kube-service-bindings')
const { Kafka } = require('kafkajs')
const { parse } = require('pi-hole-dns-log-parser')
const log = require('./log')
const { PIHOLE_LOGS_TOPIC_IN, PIHOLE_LOGS_TOPIC_OUT, KAKFAJS_CONFIG } = require('./config')

module.exports = async () => {
  log.info('building kafka connection config')
  const config = getKafkaConfig()
  log.debug('connecting to kafka using config: %j', config)

  const kafka = new Kafka(config)
  const producer = kafka.producer()
  const consumer = kafka.consumer({ groupId: 'pihole-logs-parser' })

  log.info('connecting producer and consumer instances')
  await Promise.all([
    producer.connect(),
    consumer.connect()
  ])

  await consumer.subscribe({
    topic: PIHOLE_LOGS_TOPIC_IN
  })

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        log.debug(`parsing log from topic ${topic}`)

        const logstr = message.value.toString('utf8')
        log.debug(`parsing log before: ${logstr}`)

        const result = parse(logstr)

        if (result) {
          log.debug('parsing log after: %j', result)

          const messages = [{
            // This should create a sufficiently unique key. Each query has
            // a unique numeric "id" but restarts reset the counter, so
            // joining it with the IP/port should keep keys more unique
            key: `${result.data.id}:${result.data.client_address}/${result.data.query_port}`,
            value: JSON.stringify(result)
          }]
          log.debug('writing message to output topic: %j', messages)
          await producer.send({
            topic: PIHOLE_LOGS_TOPIC_OUT,
            messages,
          })
          log.debug('parsed and forwarded log successfully')
        } else {
          log.debug('log line was not related to a DNS query')
        }
      } catch (e) {
        log.error(`error when processing a log line`)
        log.error(e)
      }
    }
  })
}

function getKafkaConfig () {
  if (KAKFAJS_CONFIG.brokers) {
    log.info('using kafka config from environment variables')
    return KAKFAJS_CONFIG
  } else {
    log.info('using kafka config from service binding')
    return getBinding('KAFKA', 'kafkajs')
  }
}
