#!/usr/bin/env bash
set -e

host=$1
shift
timeout=$1
shift
cmd=$@

until docker-compose exec -T ${host} bash -c "${cmd}" > /dev/null 2>&1; do
  >&2 echo "Service ${host} is unavailable - sleeping"
  sleep 1
done

>&2 echo "Service ${host} is up - executing command"
exec ${cmd}
