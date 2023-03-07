const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = mongoose.Schema(
  {
    login: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstname: { type: String, default: '' },
    lastname: { type: String, default: '' },
    phone: { type: String, default: '' },
    roles: { type: Array, default: [] },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true },
)
userSchema.plugin(uniqueValidator)

module.exports = mongoose.model('User', userSchema)
