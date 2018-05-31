const express = require("express")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const cors = require("cors")

const app = express()
app.use(bodyParser.json())
app.use(cors())

morgan.token("body", (req, res) => { 
    return JSON.stringify(req.body)
})

app.use(morgan((tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens['response-time'](req, res), 'ms',
        tokens.body(req, res)
    ].join(" ")
}))

let persons = [
    {
        name: "Arto Hellas",
        number: "040-123456",
        id: 1
    },    
    {
        name: "Martti Tienari",
        number: "040-123456",
        id: 2
    },
    {
        name: "Arto Järvinen",
        number: "040-123456",
        id: 3
    },
    {
        name: "Lea Kutvonen",
        number: "040-123456",
        id: 4
    }   
]

app.get("/info", (request, response) => {
    response.send(`<div>Puhelinluettelossa on ${persons.length} henkilön tiedot</div><p>${new Date()}</p>`)
})

app.get("/api/persons",  (request, response) => {
    response.json(persons)
})

app.get("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if(person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.post("/api/persons", (request, response) => {
    const body = request.body

    if(!body.name || !body.number 
        || body.name === null || body.number === null 
        || body.name.length === 0 || body.number.length === 0) {
        return response.status(400).json({error: "name or number missing"})
    }

    // Case-sensitive handling of names
    if(persons.find(person => person.name === body.name)) {
        return response.status(400).json({error: `Person ${body.name} already exists`})
    }

    const newPerson = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    persons = persons.concat(newPerson)
    response.json(newPerson)
})

app.delete("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

const generateId = () => {
    return Math.floor(Math.random() * 10000000)
}

const port = process.env.PORT || 3001
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})