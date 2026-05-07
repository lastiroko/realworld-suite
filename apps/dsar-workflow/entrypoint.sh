#!/bin/sh
# Bridges Fly.io's DATABASE_URL (postgres://USER:PASS@HOST:PORT/DB) to the
# JDBC URL + separate credentials Spring Boot expects. Set SPRING_DATASOURCE_URL
# directly to bypass this conversion.

set -e

if [ -n "$DATABASE_URL" ] && [ -z "$SPRING_DATASOURCE_URL" ]; then
  raw="${DATABASE_URL#postgres://}"
  raw="${raw#postgresql://}"

  creds="${raw%%@*}"
  hostpath="${raw#*@}"

  user="${creds%%:*}"
  pass="${creds#*:}"

  export SPRING_DATASOURCE_URL="jdbc:postgresql://${hostpath}"
  export SPRING_DATASOURCE_USERNAME="${user}"
  export SPRING_DATASOURCE_PASSWORD="${pass}"
fi

exec java $JAVA_OPTS -jar /app/app.jar
