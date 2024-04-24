## Overview

This project is built using NestJS for the backend and React for the frontend, encapsulated in a Docker container for easy deployment. Our application conforms to modern web standards and security practices, providing a seamless and safe user experience.

### Key Features

- **Real-Time Multiplayer Pong Game:** Play the classic Pong game in real-time with other players.
- **Interactive Chat System:** Communicate with other players through public and private channels or via direct messages.
- **User Authentication:** Secure OAuth login system using 42 intranet credentials.
- **Profile Management:** Customize your profile with an avatar, set up two-factor authentication, and manage friend lists.
- **Game Statistics:** Track your wins, losses, and overall match history.
- **Matchmaking System:** Join a queue and get matched with other players automatically.
- **Responsive Design:** Enjoy a seamless experience across all devices.

## Technologies Used

- **Backend:** NestJS
- **Frontend:** React (TypeScript)
- **Database:** PostgreSQL
- **Authentication:** OAuth
- **Deployment:** Docker (rootless mode)

## Security Features

- Hashed passwords
- Protection against SQL injections
- Server-side validation of user inputs
- Environment-specific credentials managed through `.env` files
