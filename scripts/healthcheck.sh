for ((attempt = 1; attempt <= 5; ++attempt)); do
  sleep 5
  response_code=$(curl -o /dev/null -s -w "%{http_code}" $HOSTNAME/health)
  if [ "$response_code" == "200" ]; then
    echo "Server is healthy (Status code: 200)"
    exit 0
  else
    echo "Attempt $attempt: Server is not healthy (Status code: $response_code)"
  fi
done
echo "Maximum number of attempts reached. Exiting..."
exit 1
