const mongoose = require("mongoose")
if(process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const url = process.env.MONGODB_URI

mongoose
    .connect(url)
    .catch(error => {
        console.log("in mongoose.connect catch", error)
    })

const Person = mongoose.model('Person', {
    name: String,
    number: String
})

const get = () => {
    Person
        .find({})
        .then(result => {
            console.log("puhelinluettelo:")
            result.forEach(entry => {
                console.log(entry.name, entry.number)
            })
            mongoose.connection.close()
        })
        .catch(error => {
            console.log("in get: ", error)
        })
}

const getWithIds = () => {
    Person
        .find({})
        .then(result => {
            result.forEach(entry => {
                console.log(entry.name, entry.number, entry.id)
            })
            mongoose.connection.close()
        })
}

const find = (name) => {
    Person.find({name: name}).then(result => {
        console.log(result)
        mongoose.connection.close()
    }).catch(error => {
        console.log(error)
    })
}

const add = (name, number) => {
    console.log("lisätään henkilö", name, "numero", number, "luetteloon")
    const person = new Person({
        name: name,
        number: number
    })

    person
        .save()
        .then(response => {
            mongoose.connection.close()
        }).catch(error => {
            console.log("in add: ", error)
        })
}

const main = () => {
    
    if(process.argv.length === 4) {
        add(process.argv[2], process.argv[3])
    } else {
        get()
    } 
}
 
main()

