# Listen Demo App
Simple websocket online user tracking and live private chatting with express.js & socket.io

### Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
What you need to install
* [NodeJS](https://nodejs.org/en/) - Platform used

### Installing
Steps for installing packages

```
npm install
```

### Start the development server
Your server will run on port 3000 as default. To change it, go to ./index.js line 9, and change the value of the PORT constant

```
const PORT = 3000;
```

To start your app, simply run

```
npm start
```

Your app will be available on

```
http://localhost:3000
```

### Notes
Chats & user are not persistent, meanings that the users used to login to the site is not validated and authenticated in any way and every chat session ends when the chat container closed. Implements your own logic to save all the data to the API or to the database.