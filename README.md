# VocaCare: AI-Powered Call Session Management System

![VocaCare Logo](https://via.placeholder.com/150x50?text=VocaCare)

## Table of Contents
- [1. Project Overview](#1-project-overview)
- [2. Features](#2-features)
- [3. Technologies Used](#3-technologies-used)
- [4. Getting Started](#4-getting-started)
  - [4.1. Prerequisites](#41-prerequisites)
  - [4.2. Installation](#42-installation)
  - [4.3. Environment Variables](#43-environment-variables)
  - [4.4. Database Setup](#44-database-setup)
  - [4.5. Running the Application](#45-running-the-application)
- [5. Usage](#5-usage)
  - [5.1. Twilio Webhooks](#51-twilio-webhooks)
  - [5.2. API Endpoints](#52-api-endpoints)
- [6. Project Structure](#6-project-structure)
- [7. Testing](#7-testing)
- [8. SDLC Phases](#8-sdlc-phases)
- [9. Future Enhancements](#9-future-enhancements)
- [10. Contributing](#10-contributing)
- [11. License](#11-license)
- [12. Contact](#12-contact)

## 1. Project Overview

VocaCare is an advanced AI-powered call session management system designed to streamline and automate interactions with callers. It leverages cutting-edge AI services like OpenAI for transcription and natural language understanding, and ElevenLabs for realistic text-to-speech, integrated seamlessly with Twilio for call handling and recording. The system aims to provide a robust, scalable, and intelligent solution for managing patient interactions, extracting key information, and generating dynamic responses.

## 2. Features

- **Incoming Call Handling**: Manages incoming calls via Twilio webhooks.
- **Call Recording Processing**: Processes recorded call audio for transcription and analysis.
- **AI-Powered Transcription**: Utilizes OpenAI's Whisper for accurate speech-to-text conversion.
- **Natural Language Understanding (NLU)**: Extracts critical information from transcribed conversations using OpenAI's GPT models.
- **Dynamic Prompt Generation**: Generates context-aware prompts for subsequent interactions.
- **Realistic Text-to-Speech (TTS)**: Converts AI-generated prompts into natural-sounding audio using ElevenLabs.
- **Call Session Management**: Stores and retrieves call session data, including `CallSid`, `contactNumber`, and conversation history, using MongoDB.
- **Modular Architecture**: Designed with a clear separation of concerns for maintainability and scalability.
- **Error Handling & Logging**: Centralized error handling and logging for robust operation.

## 3. Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **AI Services**: 
  - OpenAI (Whisper for ASR, GPT for NLU/Prompt Generation)
  - ElevenLabs (Text-to-Speech)
- **Telephony**: Twilio (Voice, Recordings)
- **Dependency Management**: npm
- **Development Tools**: Nodemon (for development hot-reloading), ESLint (for code linting)

## 4. Getting Started

Follow these instructions to set up and run the VocaCare project locally.

### 4.1. Prerequisites

Ensure you have the following installed on your system:
- Node.js (v14.x or higher)
- npm (v6.x or higher)
- MongoDB (Community Server or MongoDB Atlas account)
- Git
- ngrok (for exposing your local server to Twilio webhooks)

### 4.2. Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/vocacare.git
   cd vocacare
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### 4.3. Environment Variables

Create a `.env` file in the root directory of the project and add the following environment variables. Replace the placeholder values with your actual credentials.

```env
PORT=3000

MONGODB_URI=mongodb://localhost:27017/vocacare

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_elevenlabs_voice_id
```

### 4.4. Database Setup

Ensure your MongoDB instance is running. The application will automatically connect to the `MONGODB_URI` specified in your `.env` file and create the necessary collections.

### 4.5. Running the Application

To start the development server:

```bash
npm start
```

The server will typically run on `http://localhost:3000` (or the `PORT` specified in your `.env` file).

To expose your local server to the internet using ngrok (required for Twilio webhooks):

```bash
ngrok http 3000
```

Note the `https` forwarding URL provided by ngrok (e.g., `https://abcdef12345.ngrok.io`). You will need this for Twilio configuration.

## 5. Usage

### 5.1. Twilio Webhooks

Configure your Twilio phone number to use the following webhooks:

- **A Message Comes In**: `[YOUR_NGROK_URL]/api/twilio/webhook` (HTTP POST)
- **A Call Comes In**: `[YOUR_NGROK_URL]/api/twilio/incoming-call` (HTTP POST)
- **Voice & Fax -> Call Status Changes**: `[YOUR_NGROK_URL]/api/twilio/status-callback` (HTTP POST)

### 5.2. API Endpoints

- **POST /api/twilio/incoming-call**: Handles incoming calls from Twilio.
- **POST /api/twilio/recording**: Processes call recordings from Twilio.
- **POST /api/twilio/webhook**: Handles incoming messages from Twilio.

Example using Postman or cURL:

```bash
# Example: Simulating a Twilio recording webhook
curl -X POST \
  https://abcdef12345.ngrok.io/api/twilio/recording \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'RecordingUrl=http://example.com/recording.mp3&CallSid=CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&From=%2B1234567890'
```

## 6. Project Structure

```
vocacare/
├── .gitignore
├── README.md
├── app.js                 # Main application entry point
├── package.json           # Project dependencies and scripts
├── package-lock.json
├── src/
│   ├── config/            # Configuration files (database, Twilio, etc.)
│   │   ├── database.config.js
│   │   ├── index.config.js
│   │   └── twilio.config.js
│   ├── middleware/        # Express middleware (error handling, logging, validation)
│   │   ├── errorhandler.js
│   │   ├── logger.js
│   │   └── validation.js
│   ├── models/            # Mongoose schemas and models
│   │   ├── callSession.model.js
│   │   └── patient.model.js
│   ├── routes/            # API route definitions
│   │   ├── call.route.js
│   │   ├── index.route.js
│   │   └── patient.route.js
│   ├── services/          # Business logic and external service integrations
│   │   ├── conversation.service.js # Manages call session logic
│   │   ├── elevanlab.service.js    # ElevenLabs TTS integration
│   │   ├── openai.services.js      # OpenAI API integration
│   │   └── twilio.service.js       # Twilio API integration
│   └── utils/             # Utility functions and helpers
│       ├── constants.js
│       ├── fileManager.js
│       └── helper.js
└── uploads/               # Directory for temporary file storage (e.g., audio files)
```

## 7. Testing

Currently, testing primarily involves:
- **Unit Testing**: Implicitly performed during development of individual service functions.
- **Integration Testing**: Manual testing using Postman and ngrok to simulate Twilio webhooks and verify end-to-end call flows.
- **Debugging**: Extensive use of `console.log` for tracing data flow and identifying issues.

Future plans include implementing a dedicated testing framework (e.g., Jest, Mocha/Chai) for comprehensive unit and integration tests.

## 8. SDLC Phases

The VocaCare project has implicitly followed an iterative Software Development Life Cycle (SDLC) process:

-   **Requirements Gathering and Analysis**: Initial understanding of the need for an AI-powered call management system, identifying core functionalities like call handling, transcription, NLU, and TTS.
-   **Design**: 
    -   **Architectural Sketch**: Conceptualizing a service-oriented architecture with distinct modules for Twilio, OpenAI, ElevenLabs, and conversation management.
    -   **Database Schema**: Designing the `CallSession` and `Patient` models to store relevant call and patient data.
    -   **API Endpoints**: Defining the necessary API routes for Twilio webhooks and internal communication.
-   **Implementation/Development**: 
    -   **Project Setup**: Initializing the Node.js project, setting up Express.js, and configuring environment variables.
    -   **Core Service Development**: Implementing the `twilio.service.js`, `openai.services.js`, `elevanlab.service.js`, and `conversation.service.js` modules.
    -   **Model Creation**: Defining Mongoose models for `CallSession` and `Patient`.
-   **Testing and Debugging (Iterative)**:
    -   **Initial Setup Verification**: Ensuring basic server functionality and Twilio webhook connectivity.
    -   **Debugging Audio File Accessibility**: Addressing issues related to `RecordingUrl` and file processing.
    -   **Logging Implementation**: Adding `console.log` statements for better visibility into data flow and errors.
    -   **`contactNumber` Validation Fix**: Identifying and resolving the `ValidationError` by correctly passing `req.body.From` to the `conversation.service.js`.
    -   **Variable Usage Correction**: Ensuring correct variable names and types are used across services.
    -   **Model Import Fixes**: Correcting any issues with Mongoose model imports.
    -   **ElevenLabs TTS Error**: Identifying the `ENOENT` error related to file saving for ElevenLabs output.

This iterative process involves implementing features, testing them, observing output, identifying errors, and applying fixes, leading to continuous refinement of the system.

## 9. Future Enhancements

- **Robust Error Handling**: Implement more sophisticated, centralized error handling mechanisms.
- **Advanced Logging**: Integrate a dedicated logging library (e.g., Winston, Morgan) for structured and configurable logging.
- **Configuration Management**: Externalize all configurations for different environments (development, staging, production).
- **Input Validation**: Implement comprehensive input validation using libraries like Joi or Express-Validator.
- **Modularization**: Further refine the modular architecture for better separation of concerns.
- **Database Abstraction**: Consider adding a database abstraction layer for easier database switching.
- **Async/Await Consistency**: Ensure consistent use of `async/await` for all asynchronous operations.
- **Code Documentation**: Add JSDoc comments for all functions, classes, and modules.
- **Comprehensive Testing**: Implement unit, integration, and end-to-end tests using a testing framework.
- **Scalability Improvements**: Explore containerization (Docker, Kubernetes) and cloud deployment strategies.
- **Enhanced AI Capabilities**: Integrate more advanced NLU for complex conversational flows.
- **User Interface**: Develop a web-based UI for managing call sessions and viewing analytics.

## 10. Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'feat: Add new feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

Please ensure your code adheres to the project's coding standards and includes appropriate tests.

## 11. License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 12. Contact

For any questions or inquiries, please contact:

-   **Your Name/Team Name** - [aalizulfiqar46@gmail.com](mailto:aalizulfiqar46@gmail.com)
-   **Project Link**: [https://github.com/codewithfourtix/vocaCare](https://github.com/codewithfourtix/vocaCare)
