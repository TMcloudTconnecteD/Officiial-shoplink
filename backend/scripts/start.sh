#!/bin/sh

# Maximum number of retries
MAX_RETRIES=5
RETRY_INTERVAL=5

# Function to attempt MongoDB connection
attempt_connection() {
    for i in $(seq 1 $MAX_RETRIES); do
        echo "Attempting to connect to MongoDB (attempt $i of $MAX_RETRIES)..."
        if node index.js; then
            echo "Successfully connected to MongoDB!"
            return 0
        fi
        echo "Connection attempt $i failed. Waiting $RETRY_INTERVAL seconds..."
        sleep $RETRY_INTERVAL
    done
    return 1
}

# Start the application with connection retry logic
attempt_connection
