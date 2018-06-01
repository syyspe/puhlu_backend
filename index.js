const express = require("express")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const cors = require("cors")
const Person = require("./models/person")

const app = express()
app.use(bodyParser.json())
app.use(express.static("build"))
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

/*
* Routes
*/
app.get("/info", (request, response) => {
    Person
        .find({})
        .then(result => {
            response.send(`<div>Puhelinluettelossa on ${result.length} henkilön tiedot</div><p>${new Date()}</p>`)
        }).catch(error => {
            console.log("info failed: ", error)
            return response.status(500).end()
        })
    
})

app.get("/api/persons",  (request, response) => {
    Person
        .find({})
        .then(result => {
            const formatted = result.map(Person.format)
            return response.json(formatted)
        }).catch(error => {
            console.log("fetching persons failed: ", error)
            return response.json({error: error})
        })
})

app.get("/api/persons/:id", (request, response) => {
    // findById throws exception if id is not of specific length apparently,
    // and if id is not found, it'll return null (so slightly different to 'find()')
    Person
        .findById(request.params.id)
        .then(result => {
            if(result === null) {
                console.log("id: ", request.params.id, " not found")
                response.status(404).json({error: "id not found"})    
            } else {
                response.json(result)
            }
    }).catch(error => {
        console.log("get by id failed: ", error.message)
        response.status(404).json({error: error.message})
    })
})

app.post("/api/persons", (request, response) => {
    const body = request.body

    if(!body.name || !body.number || body.name.length === 0 || body.number.length === 0) {
        console.log("name or number undefined")
        return response.status(400).json({error: "name or number missing"})
    }

    Person
        .find({name: body.name})
        .then(result => {
            if(result.length === 0) {
                const newPerson = new Person({
                    name: body.name,
                    number: body.number
                })
                newPerson
                    .save()
                    .then(result => {
                        response.json(Person.format(result))
                    }).catch(error => {
                        console.log("saving new person failed: ", error)
                        return response.status(500).json({error: error})
                    })
            } else {
                console.log(body.name, ": person already exists")
                return response.status(400).json({error: `Person ${body.name} already exists`})
            }
        }).catch(error => {
            console.log("catch in add, error: ", error)
            return response.status(400).json({error: error})
        })
})

app.put("/api/persons/:id", (request, response) => {
    const body = request.body

    if(!body.name || !body.number || body.name.length === 0 || body.number.length === 0) {
        console.log("name or number undefined")
        return response.status(400).json({error: "name or number missing"})
    }

    Person
        .findByIdAndUpdate(request.params.id, {number: body.number})
        .then(result => {
            response.json(Person.format(result))
        }).catch(error => {
            console.log("update failed: ", error.message)
            response.status(500).json({error: `updating person failed: ${error.message}`})
        })
})

app.delete("/api/persons/:id", (request, response) => {
    Person
        .deleteOne({_id: request.params.id})
        .then(result => {
            response.status(204).end()
        }).catch(error => {
            console.log("deleting person failed: ", error.message)
            response.status(500).json({error: `deleting person failed: ${error.message}`})
        })
})

const port = process.env.PORT || 3001
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
