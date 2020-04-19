require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

morgan.token('json-body', (req) => {
  return JSON.stringify(req.body)
})

const app = express()

app.use(express.json())
app.use(express.static('build'))
app.use(morgan('tiny', { skip: (req) => req.method === 'POST' || req.method === 'PUT' }))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :json-body',
  { skip: (req) => req.method !== 'POST' && req.method !== 'PUT' })
)

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    const numString = `<p>Phonebook has ${persons.length} entries</p>`
    const timeString = `<p>${new Date()}</p>`
    response.send(numString + timeString)
  })
})

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  // allow multiple entries for same name for now
  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      console.log(`${savedPerson.name} - ${savedPerson.number} saved`)
      response.status(201).json(savedPerson)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person === null) {
        response.status(404).json({
          error: `person with id ${request.params.id} not found`
        })
      } else {
        response.json(person)
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    number: body.number,
  }
  if (body.name) {
    person['name'] = body.name
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformed id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send(error.message)
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`)
})
