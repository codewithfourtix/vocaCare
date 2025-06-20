# VocaCare AI Backend

## Overview
Backend AI voice agent for handling inbound patient calls, collecting appointment info, and storing/updating MongoDB records. Integrates with Twilio, Whisper, GPT-3.5, and ElevenLabs.

## Features
- Handles inbound calls via Twilio
- Collects patient name, doctor, appointment date/time, contact number
- Stores/updates records in MongoDB
- Error handling and polite call flow
- ElevenLabs voice responses

## Setup
1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file (see `.env.example`):
   ```env
   MONGODB_URI=mongodb://localhost:27017/vocacare
   PORT=3000
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   OPENAI_API_KEY=your_openai_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ```
3. Start the server:
   ```bash
   node server.js
   ```
4. Expose your server to the internet (for Twilio) using Ngrok:
   ```bash
   ngrok http 3000
   ```
5. Configure Twilio Voice webhook to point to your Ngrok URL + `/api/calls/voice`

## Project Structure
- `src/models/` — Mongoose schemas
- `src/routes/` — API and Twilio routes
- `src/services/` — Integrations for Whisper, GPT, ElevenLabs
- `src/config/` — Config files
- `src/utils/` — Helpers and constants
- `src/middleware/` — Middleware
- `server.js` — Main entry point

## Notes
- Implement actual API calls in `src/services/` for production use.
- All environment variables must be set for full functionality. 