# Contact Manager Backend

This is the backend for the Contact Manager application, providing RESTful APIs to manage contacts, built with Node.js, Express, and MongoDB.

## Prerequisites
* Node.js 
* npm
* MongoDB (local or cloud instance, e.g., MongoDB Atlas)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/YoussefGoma/Contact-Manager-Backend.git
```

2. Navigate to the project directory:
```bash
cd Contact-Manager-Backend
```

3. Install dependencies:
```bash
npm install
```

4. rename `.env.example` to `.env` and add your enviroment values:

## Running the Application

1. Start the server:
```bash
npm start
```

2. The server will run on http://localhost:3000 (or the port specified in your .env file).

## Default Users

On startup, the application automatically creates two default users with the following credentials:

* **User 1**
   * Username: user1
   * Password: user1
   * Role: user
* **User 2**
   * Username: user2
   * Password: user2
   * Role: admin



## Related Repository
* [Contact Manager Frontend](https://github.com/YoussefGoma/Contact-Manager-Frontend)