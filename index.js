const express = require('express')
const app = express()

app.use(express.json())

let persons = [
	{   
		name: "Arto Hellas",
		number: "040-123456",
		id: 1
	},  
	{   
		name: "Ada Lovelace",
		number: "39-44-5323523",
		id: 2
	},  
	{   
		name: "Dan Abramov",
		number: "12-43-234345",
		id: 3
	},  
	{   
		name: "Mary Poppendieck",
		number: "39-23-6423122",
		id: 4
	}   
]

const generateId = () => {
	return Math.floor(Math.random() * 1e9)
}

app.get('/info', (request, response) => {
	const numString = `<p>Phonebook has ${persons.length} entries</p>`
	const timeString = `<p>${new Date()}</p>`
	response.send(numString + timeString)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
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

	if (persons.some(person => person.name === body.name)) {
		return response.status(400).json({
			error: `${body.name} already exists in phonebook`
		})
	}

	const personObject = {
		name: body.name,
		number: body.number,
		id: generateId()
	}

	persons = persons.concat(personObject)

	return response.status(201).json(personObject)
})

app.get('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	const person = persons.find(person => person.id === id)

	if (person) {
		response.json(person)
	} else {
		response.status(404).end()
	}
})

app.delete('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	const person = persons.find(person => person.id === id)

	if (person) {
		persons = persons.filter(person => person.id !== id)
		response.status(200).end()
	} else {
		response.status(404).end()
	}
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`)
})
