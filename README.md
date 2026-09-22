# Simple FAQ Chatbot UI
A clean, modern, and responsive chatbot interface built with *React.js* and *Vite. Powered by the **Gemini API*, this project handles real-time conversational Q&A instead of static predefined answers.

## Live Demo
[Click here to try the chatbot](https://react-chatbot-hub.netlify.app/)

## Tech Stack & Features
* Frontend Framework: *React.js*
* Build Tool: *Vite*
* AI Engine: *Google Gemini API* (@google/genai)
* State Management: *React Hooks* to manage chat messages, input state, and loading status
* UI/UX Design: *Simple chat bubbles and a responsive layout optimized for both mobile and desktop screens*

## Core Functionalities
* *Live AI Responses*: User messages are sent to the Gemini API (gemini-3.6-flash) and answered in real time.
* *Instant Message Display*: The user's message appears in the chat immediately after sending, without waiting for the AI response.
* *Loading Indicator*: A visual loading state is shown while the AI generates its reply, then automatically replaced by the response once it arrives.
* *Keyboard Shortcuts*: Press Enter to send a message, Escape to clear the input field.

## Notes
* API key is stored in a .env file and excluded from version control via .gitignore.
* Model name may require updates over time as Google deprecates older Gemini model versions.