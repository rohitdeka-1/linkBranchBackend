# LinkBranch Backend

The **LinkBranch Backend** is a Node.js-based backend application built with Express.js and MongoDB. It provides APIs for user authentication, profile management, and link management. The backend is designed to support a frontend application where users can create and manage their personalized link pages.

---

## Features

- **User Authentication**:
  - User registration, login, and logout.
  - Secure password hashing using `bcryptjs`.
  - JWT-based authentication with access and refresh tokens.

- **Profile Management**:
  - Update user profile information (e.g., bio, profile picture, and full name).
  - Upload profile pictures to Cloudinary.

- **Link Management**:
  - Add, update, delete, and fetch user links.
  - Support for ordering and grouping links.

- **Public Profile**:
  - Fetch public profiles by username.
  - Aggregate user data and links for public viewing.

- **Security**:
  - Middleware for token verification.
  - Input validation using `express-validator`.
  - Secure cookies for authentication.

- **Scalability**:
  - Modular architecture for routes, controllers, and services.
  - Cluster support for multi-core systems.

---

## Technologies Used

- **Node.js**: JavaScript runtime for building the backend.
- **Express.js**: Web framework for creating APIs.
- **MongoDB**: NoSQL database for storing user and link data.
- **Mongoose**: ODM for MongoDB.
- **Cloudinary**: Cloud service for image uploads.
- **JWT**: JSON Web Tokens for authentication.
- **bcryptjs**: Password hashing.
- **dotenv**: Environment variable management.
- **multer**: Middleware for handling file uploads.

---

## Project Structure

```
├── src
│   ├── config
│   │   └── db.js                # Database connection setup
│   ├── controllers
│   │   ├── authController.js    # Authentication logic
│   │   ├── linkController.js    # Link management logic
│   │   └── userController.js    # User profile logic
│   ├── middlewares
│   │   ├── authMiddleware.js    # JWT authentication middleware
│   │   └── errorHandler.js      # Global error handling middleware
│   ├── models
│   │   ├── Link.js              # Link schema
│   │   └── User.js              # User schema
│   ├── routes
│   │   ├── authRoutes.js        # Authentication routes
│   │   ├── linkRoutes.js        # Link management routes
│   │   └── userRoutes.js        # User profile routes
│   ├── services
│   │   ├── authService.js       # Authentication services
│   │   ├── linkService.js       # Link management services
│   │   └── userService.js       # User profile services
│   ├── utils
│   │   ├── cloudinary.js        # Cloudinary configuration
│   │   └── tokenUtils.js        # Token generation and validation
│   └── app.js                   # Express app setup
├── .env                          # Environment variables
├── .gitignore                    # Git ignore file
├── package.json                  # Project metadata and dependencies
├── package-lock.json             # Dependency lock file
└── server.js                     # Entry point of the application
```








---

## API Endpoints

### **Authentication**
| Method | Endpoint         | Description               |
|--------|------------------|---------------------------|
| POST   | `/api/v1/auth/register` | Register a new user.       |
| POST   | `/api/v1/auth/login`    | Login a user.              |
| POST   | `/api/v1/auth/logout`   | Logout a user.             |

### **User**
| Method | Endpoint               | Description                        |
|--------|------------------------|------------------------------------|
| GET    | `/api/v1/user/me`      | Fetch the logged-in user's profile. |
| PUT    | `/api/v1/user/user-up` | Update user profile.               |
| POST   | `/api/v1/user/upload-image` | Upload a profile picture.         |

### **Links**
| Method | Endpoint               | Description                        |
|--------|------------------------|------------------------------------|
| GET    | `/api/v1/links/:username` | Fetch public links by username.   |
| POST   | `/api/v1/user/links`   | Add a new link.                    |
| PUT    | `/api/v1/links/:linkId` | Update an existing link.           |
| DELETE | `/api/v1/user/:linkId` | Delete a link.                     |

---

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
MONGO_URI=<your-mongodb-connection-string>
ACCESS_TOKEN_SECRET=<your-access-token-secret>
REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
ACCESS_TOKEN_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=5d
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>



## Installation and Setup

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/rohitdeka-1/linkBranch-backend.git
    cd linkBranch-backend
    ```

2. **Install Dependencies**:
    ```bash
    npm install
    ```

3. **Set Up Environment Variables**:
    - Create a `.env` file in the root directory.
    - Add the required environment variables as mentioned in the [Environment Variables](#environment-variables) section.

4. **Start the Application**:
    - For development:
      ```bash
      npm run dev
      ```
    - For production:
      ```bash
      npm start
      ```

---

## Dependencies

The project uses the following dependencies:

- **Core Dependencies**:
  - `express`: Web framework for Node.js.
  - `mongoose`: MongoDB object modeling tool.
  - `bcryptjs`: Password hashing library.
  - `jsonwebtoken`: For generating and verifying JWTs.
  - `dotenv`: For managing environment variables.
  - `multer`: Middleware for handling file uploads.

- **Development Dependencies**:
  - `nodemon`: For automatically restarting the server during development.

---

## Author

Developed and maintained by [Rohit Deka](https://github.com/rohitdeka-1).  
Feel free to reach out for any queries or contributions!