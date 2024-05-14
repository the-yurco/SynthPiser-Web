# Synthpiser / MPC Project

## Overview

This project combines both a web application and embedded systems to create a Synthpizer (Synthesizer + Sampler) or MPC (Music Production Center) system. The web application is built with React.js, while the embedded system is programmed with Python to run on a Raspberry Pi. The project allows users to interact with the Synthpizer/MPC through the web interface, selecting sounds and controlling playback, while the embedded system handles the actual playback of sounds and interaction with physical buttons.

### Web Application (React.js)

The web application provides a user-friendly interface for interacting with the Synthpizer/MPC. Users can:

- Browse and select sounds from a list fetched from an API (FreeSound API).
- Assign selected sounds to physical buttons on the embedded system.
- Control playback of assigned sounds, including play, pause, stop, and reset functions.
- Monitor playback status and adjust settings such as reverb and distortion.
- Search for specific sounds using a search bar.
- View visual representations of selected sounds.

### Embedded System (Python on Raspberry Pi)

The embedded system serves as the backend for the Synthpizer/MPC, handling sound playback and physical button interaction. It:

- Utilizes a Raspberry Pi for hardware control and sound playback.
- Interfaces with physical buttons to trigger sound playback events.
- Communicates with the web application via WebSocket to receive sound assignments and button click events.
- Preloads sound files from the web application for quick playback.
- Controls audio playback using the Pygame library.
- Detects button clicks and sends events to the web application for visual feedback.

## Features

- **Web Application**:
  - Fetch sounds from the FreeSound API for selection.
  - Assign selected sounds to physical buttons.
  - Control playback of assigned sounds.
  - Visual feedback for sound selection and playback.
- **Embedded System**:
  - Interface with physical buttons for triggering sounds.
  - Preload sound files for quick playback.
  - Handle sound playback using Pygame.
  - Communicate with the web application via WebSocket.

## Technologies Used

- **Web Application**:
  - React.js: Frontend framework for building user interfaces.
  - WebSocket: For real-time communication with the embedded system.
  - Axios: HTTP client for fetching sound data from the FreeSound API.
- **Embedded System**:
  - Raspberry Pi: Hardware platform for embedded system development.
  - Python: Programming language used for backend development.
  - Pygame: Library for audio playback and control.

## Usage

1. Clone the repository.
2. Install dependencies for the web application using `npm install`.
3. Run the web application using `npm start`.
4. Ensure the Raspberry Pi is set up and connected to the same network.
5. Run the Python script on the Raspberry Pi to start the embedded system.

## Acknowledgments

- Special thanks to the creators of the FreeSound API for providing access to a wide range of sounds.
- Thanks to the Raspberry Pi community for their resources and support in embedded system development.

## Authors

- Yurco & Rondon
