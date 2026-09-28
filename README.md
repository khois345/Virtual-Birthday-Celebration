# Birthday Celebration

An interactive birthday card built with Next.js. Users enter a name, age, and short regard message, then the app renders a decorated cake with candles based on the age. The candles can be blown out with the microphone or by clicking the blow button.

## Features

- Multi-language birthday pages: `en`, `es`, `id`, `ja`, `ko`, `th`, `vi`, and `zh`
- Birthday form with name, age, and regard message fields
- Cake generation with randomized color palettes
- Candle blowing by microphone input and manual button action
- Shareable session URLs for birthday cards
- Refresh and return actions on the celebration page

## Tech Stack

- Next.js 15
- React 18
- TypeScript
- MongoDB
- Tailwind CSS
- Sass
- Framer Motion
- React Toastify
- React Device Detect

## Setup

### Prerequisites

- Node.js 18 or newer
- A MongoDB database

### Install

```bash
npm install
```

### Environment Variables

Create a `.env.local` file with your MongoDB connection string:

```bash
MONGODB_URI="your-mongodb-connection-string"
```

The app uses this value in `lib/mongodb.ts` and the birthday session API route.

## Development

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Production Build

```bash
npm run build
npm run start
```

## Project Flow

1. The home page shows the form for the birthday message.
2. Submitting the form creates a birthday session in MongoDB.
3. The session page loads the birthday name, regard, and cake.
4. The user can switch cake colors, refresh the page, or return home.
5. The candle effect can be triggered by microphone input or by clicking the blow button.

## Data Notes

- Sessions are stored in the `birthday-app` database.
- Session records live in the `birthday_sessions` collection.
- Sessions expire after 3 days.
- The API limits a device to 5 sessions per day.

## Inspiration

This project was inspired by Tru Narla (mewtru) and the original birthday cake concept shared here:

- https://www.instagram.com/mewtru/
- https://www.twitch.tv/mewtru/
- https://www.instagram.com/p/C02aFOdvisW/
- https://codepen.io/fazlurr/pen/gPMJMK

## License

This project is licensed under the [MIT License](LICENSE). If you use or modify it, please keep the original credits.
