# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). A user can create and update their URLs. In the main page, a user can see their saved URLs, as well as how many visits and unique visitors their short URL has had. Additionally, in each URLs page, a collapsable table displays a visit log with the visitor id and timestamp of each visit to the short URL.

## Final Product

!["Screenshot of My URLs Page"](https://github.com/cangoman/tinyapp/blob/master/docs/my_urls.png?raw=true)
!["Screenshot of Short URL Page showing the visit log"](https://github.com/cangoman/tinyapp/blob/master/docs/visit_log.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Access the application by visiting localhost:8080