import express from 'express';
import logger from "./logger.js";
import morgan from "morgan";

const app = express()
const port = 3000

app.use(express.json())


const morganFormat = ":method :url :status :response-time ms";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);


const teaData = []
let nextId = 1

// Add a new tea
app.post('/tea', (req, res) => {
    const {name, price} = req.body
    const newTea = {id: nextId++, name, price}
    teaData.push(newTea)
    res.status(201).send(newTea)
})

// Get all tea
app.get('/all-tea', (req, res) => {
    logger.info(res)
    res.send(teaData)
})

// Get tea with id
app.get('/tea/:id', (req, res) => {
    const tea = teaData.find(tea => tea.id === parseInt(req.params.id))
    if(!tea){
        return res.status(404).send("Tea not found!")
    
    }
    res.status(200).send(tea)
    
})

// Update tea
app.put('/tea/:id', (req, res) => {
    const tea = teaData.find(tea => tea.id === parseInt(req.params.id))
    if(!tea){
        return res.status(404).send("Tea not found!")
        
    }
    const {name, price} = req.body
    tea.name = name
    tea.price = price
    res.status(200).send(tea)
})

// Delete tea
app.delete('/tea/:id', (req, res) => {
    const index = teaData.findIndex(tea => tea.id === parseInt(req.params.id))
    if(index === -1){
        return res.status(404).send("Tea not found!")
    }
    teaData.splice(index, 1)
    res.status(200).send("Deleted")
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})