require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

morgan.token('posttoken', (req, res) => { 
    if (req.method === 'POST') return JSON.stringify(req.body)
    else return ''
})

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :posttoken'))
app.use(cors())
app.use(express.static('build'))

let persons = []

app.get('/api/persons', (req, res) => {
    //res.json(persons)

    Person.find({}).then(persons => {
        console.log('persons....', persons)
        res.json(persons.map(person => person.toJSON()))
    }).catch(error => {
        console.log('error getting all persons... ', error.message)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person.toJSON())
            } else {
                res.status(404).end()
            }           
        }).catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

app.get('/info', (req, res) => {
    Person.find({}).then(persons => {
        res.send(
            `<div>
            <p>Phonebook has info for ${persons.length} people</p>
            <p>${new Date()}</p>
            </div>`
        )
    })
})

app.post('/api/persons', (req, res, next) => {
    const body = req.body

    if (body.name === undefined || body.number === undefined) {
        return res.status(400).json({ error: 'content missing'})
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    }) 

    person.save()
        .then(savedNote => {
            res.json(savedNote.toJSON())
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(req.params.id, person, { new: true})
        .then(response => {
            res.json(response.toJSON())
        })
        .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    // error.kind seems to be found here
    const errorKind = error.errors.kind
    const errPath = error.errors.path

    // Error handling logic
    /*switch (error.name) {
        case 'CastError':
            for (field in error.errors) {
                switch (error.errors[field].kind) {
                    case 'ObjectId':
                        return res.status(400).send( {error: 'malformatted id' })
                }    
            }
        break
        case 'ValidationError':
            for (field in error.errors) {
                switch (error.errors[field].kind) {
                    case 
                }
            }
    }

    if ( error.name === 'CastError' ) {
        if ( )
    } */
    // https://github.com/blakehaswell/mongoose-unique-validator#readme
    // https://stackoverflow.com/questions/14407007/best-way-to-check-for-mongoose-validation-error
    // error.errors -> taulukko, kentät saa nimen jostain esim mongooseError --> .kind löytyy


    if (error.name === 'CastError' && errorKind == ('ObjectId')) {
        return res.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError' && errorKind == ('unique')) {
        return res.status(403).send({ error: 'duplicate entry'})
    } else if (error.name === 'ValidationError' && errorKind == ('minlength')) {
        if (errPath == ('name')) return res.status(403).send({ error: 'name too short' })
        else if ( errPath == ('number')) return res.status(403).send ({ error: 'number too short'})
    } 

    next (error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
