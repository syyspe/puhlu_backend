const mongoose = require("mongoose")
if(process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const url = process.env.MONGODB_URI

const Schema = mongoose.Schema
const personSchema = new Schema({
    name: String,
    number: String
})

personSchema.statics.format = function (person) {
    return {
        name: person.name,
        number: person.number,
        id: person._id
    }
}

mongoose
    .connect(url)
    .catch(error => {
        console.log("in mongoose.connect catch", error)
        throw(error)
    })


const Person = mongoose.model('Person', personSchema)

module.exports = Person