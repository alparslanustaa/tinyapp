# Tiny App



Tiny app is a full stack program that converts longUrls to Shorter urls by using the node.js and Express(à la bit.ly).

  
  

## Finished App

  !["Screenshot of URLs page"](https://github.com/alparslanustaa/tinyapp/blob/master/docs/Screen%20Shot%202022-01-28%20at%204.02.27%20PM.png?raw=true)


  

## Dependencies

  

I. Node.js
   
II. Express
   
III. EJS
   
IV. bcrypt
   
V. body-parser
   
VI. cookie-session

  

## Getting Started

  

- Install all dependencies (using the npm install command).

- Run the development web server using the node express_server.js command.

## Create Your Templates

-   Create your .ejs file that will be rendered when a user visits the site.
-   Create and customize views and partials templates.

## URL Shortening

-   Update  `express_server.js`  to render your home page with only the URL submitted by the logged in user.
-   Allow for only the owner of the Short URL to edit and delete a URL.

## User Database

-   Update  `express_server.js`  to display the correct status messages if the user is trying to register using an existing email, or if trying to register with bad credentials (empty password field).
-   Set permission according to intended redirect after successful login or register.

## Passwords

-   Encrypt user passwords using bcryptjs for an improved user password protection.

## Cookies

-   Enable cookie-sessions for encrypted cookie sessions.
