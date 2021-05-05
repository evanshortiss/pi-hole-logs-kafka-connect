FROM alpine:3.12

WORKDIR /usr/src/app

# Bash (sh doesn't work) and OpenJDK are required to run Kafka Connect
RUN apk add bash openjdk8

RUN mkdir /usr/src/app/config/

RUN wget https://downloads.apache.org/kafka/2.8.0/kafka_2.12-2.8.0.tgz
RUN tar -xzf kafka_2.12-2.8.0.tgz
RUN rm -rf kafka_2.12-2.8.0.tgz

WORKDIR /usr/src/app/kafka_2.12-2.8.0/

CMD [ "bash", "bin/connect-standalone.sh", "/usr/src/app/config/worker.properties", "/usr/src/app/config/connector.properties" ]
