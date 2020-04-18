require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

morgan.token('json-body', (req, res) => {
  return JSON.stringify(req.body)
})

const app = express()

app.use(express.json())
app.use(express.static('build'))
app.use(morgan('tiny', { skip: (req, res) => req.method === 'POST' }))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :json-body',
      { skip: (req, res) => req.method !== 'POST' }))

const generateId = () => {
	return Math.floor(Math.random() * 1e9)
}

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    const numString = `<p>Phonebook has ${persons.length} entries</p>`
    const timeString = `<p>${new Date()}</p>`
    response.send(numString + timeString)
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
	const body = request.body

	if (!body.name) {
		return response.status(400).json({
			error: 'name missing'
		})
	}
	if (!body.number) {
		return response.status(400).json({
			error: 'number missing'
		})
	}

  // allow multiple entries for same name for now
	// if (persons.some(person => person.name === body.name)) {
	// 	return response.status(400).json({
	// 		error: `${body.name} already exists in phonebook`
	// 	})
	// }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    console.log(`${savedPerson.name} - ${savedPerson.number} saved`)
    response.status(201).json(savedPerson)
  })
	// persons = persons.concat(personObject)

	// return response.status(201).json(personObject)
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
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: "unknown endpoint" })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformed id' })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`)
})
