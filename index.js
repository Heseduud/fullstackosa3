const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

morgan.token('posttoken', (req, res) => { 
    if (req.method === 'POST') return JSON.stringify(req.body)
    else return ''
})

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :posttoken'))
app.use(cors())

let persons = [
    {
        name: "Arto Hellas",
        number: "040-123456",
        id: 1
    },
    {
        name: "Ada Lovelace",
        number: "39-44-5323523",
        id: 4
    },
    {
        name: "Dan Abramov",
        numbeid: "12-43-234345",
        id: 3
    },
    {
        name: "Mary Poppendieck",
        numbeid: "39-23-643122",
        id: 4
    }
]

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.delete('/api/persons/:id', (req,res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)

    res.status(204).end()
})

app.get('/info', (req, res) => {
    res.send(
        `<div>
            <p>Phonebook has info for ${persons.length} people</p>
            <p>${new Date()}</p>
        </div>`
    )
})

app.post('/api/persons', (req,res) => {
    const body = req.body

    if (!body.name) {
        return res.status(400).json({
            error: 'name missing'
        })
    } else if (!body.number) {
        return res.status(400).json({
            error: 'number missing'
        })
    } else if (persons.find(person => person.name === body.name)) {
        return res.status(400).json({
            error: `${body.name} already exists`
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId(0, 10000)
    }

    persons = persons.concat(person)
    res.json(person)
})

const generateId = (min, max) => {
    min = Math.ceil(min)
    max = Math.floor(max)
    
    return Math.floor(Math.random() * (max - min) + min)
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
