// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/*const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const orderRoutes = require('./routes/order')
const bookerRoutes = require('./routes/booker')
const staffRoutes = require('./routes/staff')*/

mongoose
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  .connect(process.env.DATABASE_URI!)
  .then(() => console.log('Connexion à MongoDB réussie !!'))
  .catch((e) => console.log(e, 'Connexion à MongoDB échouée !'))

/*app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/order', orderRoutes)
app.use('/api/booker', bookerRoutes)
app.use('/api/staff', staffRoutes)*/

export default app
