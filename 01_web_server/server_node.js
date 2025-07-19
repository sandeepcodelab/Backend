const http = require('http');

const hostName = '127.0.0.1';
const port = 3000

const server = http.createServer((req, res) => {
    if (req.url === "/") {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/palin')
        res.end("Hello")
    }
    else if (req.url === "/") {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/palin')
        res.end("Hello")
    }
    else if (req.url === "/hi") {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/palin')
        res.end("Hi my name is node js and I'm from backend!")
    }
    else {
        res.statusCode = 404
        res.setHeader('Content-Type', 'text/palin')
        res.end("404 Not found!")
    }
})

server.listen(port, hostName, () => {
    console.log(`Server is listening at http://${hostName}:${port}`);
    
})