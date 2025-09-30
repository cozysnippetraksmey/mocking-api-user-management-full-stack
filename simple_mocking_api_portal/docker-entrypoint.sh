#!/bin/sh

# Replace environment variables in env.js at runtime
envsubst '${API_URL} ${ENABLE_TOAST} ${ENABLE_PAGINATION} ${DEFAULT_PAGE_SIZE}' < /usr/share/nginx/html/assets/env.js > /tmp/env.js
mv /tmp/env.js /usr/share/nginx/html/assets/env.js

# Start nginx
nginx -g "daemon off;"
