#!/bin/bash

# Navigate to the directory where the script is located
cd "$(dirname "$0")"

# Start the development server in the background
npm run dev &

# Wait a few seconds for the server to start
sleep 10

# Launch the browser in kiosk mode
/usr/bin/chromium-browser --kiosk --disable-infobars --start-fullscreen --start-maximized --autoplay-policy=no-user-gesture-required --no-sandbox http://localhost:3000