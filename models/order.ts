import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    booker: { type: mongoose.Schema.Types.ObjectId, ref: 'Booker' },
    eventDate: { type: Date, required: true },
    eventStatus: { type: Boolean, required: false, default: null, null: true },
    eventLocation: { type: String, required: true },
    eventOrderNumber: {
      type: String,
      required: false,
      default: '',
    },
    eventAddress: { type: Object, required: true },
    eventType: { type: String, required: true },
    customerName: { type: String, required: true },
    guestsCount: { type: Number, required: true },
    teams: [
      {
        type: { type: String, required: true },
        quantity: { type: Number, required: true },
        from: { type: Date, required: true },
        to: { type: Date, required: true },
        notice: {
          type: String,
          required: false,
          default: '',
        },
        members: [
          {
            staff: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Staff',
              required: false,
              default: null,
            },
            notice: {
              type: String,
              required: false,
              default: '',
            },
            isReferent: {
              type: Boolean,
              required: false,
              default: false,
            },
            isAvailable: {
              type: Boolean,
              required: false,
              default: null,
              null: true,
            },
          },
        ],
      },
    ],
    clothes: [
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
    eventNotice: { type: String, required: false },
    adminNotice: { type: String, required: false },
    status: { type: Boolean, default: null, null: true },
    googleEventId: { type: String, required: false, default: null, null: true },
    archived: { type: Boolean, required: false, default: false, null: true },
  },
  { timestamps: true },
)

export default mongoose.model('Order', orderSchema)
