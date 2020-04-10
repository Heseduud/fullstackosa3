const mongoose = require('mongoose')

if (process.argv.length<3) {
    console.log('Argument missing (password for mongo)')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://heseduud:${password}@cluster0-ifmbn.mongodb.net/test?retryWrites=true&w=majority`
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
    Person.find({}).then(result => {
        console.log('Phonebook: ')
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
} else if (process.argv.length === 5) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })
    
    person.save().then(result => {
        console.log(`${person.name} saved to mongo`)
        mongoose.connection.close()
    })
} else {
    console.log('Too many/not enough args: ', process.argv.length)
    process.exit(1)
}

