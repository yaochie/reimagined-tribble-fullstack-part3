const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password, name, number as arguments')
  process.exit(1)
} else if (process.argv.length == 4) {
  console.log('give password, name, number as arguments')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@phonebook-cluster-9acgb.mongodb.net/phonebook-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length > 3) {
  const name = process.argv[3]
  const number = process.argv[4]

  const person = new Person({
    name: name,
    number: number
  })

  person.save().then(response => {
    console.log(`${name} - ${number} saved`)
    mongoose.connection.close()
  })
} else {
  // print all
  Person.find({}).then(result => {
    console.log("phonebook:")
    result.forEach(person => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })
}

