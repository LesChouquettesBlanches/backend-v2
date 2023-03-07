import mongoose from 'mongoose'

const bookerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    defaultClothes: [
      {
        type: Object,
        default: {
          whiteShirt: { type: Boolean, default: false },
          blackShirt: { type: Boolean, default: false },
          suitJacket: { type: Boolean, default: false },
          bowTie: { type: Boolean, default: false },
          tie: { type: Boolean, default: false },
          vest: { type: Boolean, default: false },
        },
      },
    ],
    company: { type: String, default: '' },
    orderColor: { type: String, default: '#ffffff' },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  },
  { timestamps: true },
)

export default mongoose.model('Booker', bookerSchema)
