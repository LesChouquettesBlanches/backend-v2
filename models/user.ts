import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
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

export default mongoose.model('User', userSchema)
