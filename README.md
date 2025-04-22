# Node.js Proof of Concept

This project is a Proof of Concept (PoC) implementation of a server-side application using Node.js as an alternative to Symfony on PHP.

## Features

- 🚀 Modern stack: Node.js + Express + Vue 3
- 🔥 Hot reload in development mode
- 📦 Modular architecture with support for multiple applications
- 🛠️ TypeScript for reliable development
- ⚡ Vite for fast builds

## Project Structure

```
├── src/
│   └── apps/          # Modular applications
│       ├── announcer/ # Example app 1
│       └── analytics/ # Example app 2
├── dist/             # Built files
├── public/           # Static files
└── index.ts         # Server entry point
```

## Installation and Running

### Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Production

```bash
# Build and run in production mode
npm run prod
```

## Operation Modes

### Development (`npm run dev`)

- Automatic rebuild on changes
- Hot server reload
- Automatic browser refresh
- Non-minified files with source maps

### Production (`npm run prod`)

- Optimized build
- Minified files
- Development mode disabled
- Maximum performance

## Technologies

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: Vue 3, Vite
- **Tools**: TypeScript, Nodemon, WebSocket
- **Management**: npm, Git

## License

MIT
