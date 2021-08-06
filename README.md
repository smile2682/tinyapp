# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

![register page](https://github.com/smile2682/tinyapp/blob/b3138a7a05005f0dd2915c5a3d4dddae939846b9/docs/register-page.png?raw=true)

![create your own short urls!](https://github.com/smile2682/tinyapp/blob/b3138a7a05005f0dd2915c5a3d4dddae939846b9/docs/create-new-url.png?raw=true)

![your short urls database!](https://github.com/smile2682/tinyapp/blob/b3138a7a05005f0dd2915c5a3d4dddae939846b9/docs/urls-page.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Once connected, register a new account, which is secured by bcrypt and cookie-session.
- click "create new url" to start shortening long url!
- click "My URLs" to view your short URLs library. You can also edit and delete urls here.
