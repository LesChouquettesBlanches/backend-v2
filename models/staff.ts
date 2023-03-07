import mongoose from 'mongoose'

const staffSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    birth: { type: Object, default: { date: null, location: '' } },
    address: {
      type: Object,
      default: {
        street: '',
        city: '',
        country: '',
        zipCode: '',
        additional: '',
      },
    },
    languages: [{ type: Object }],
    clothesSize: {
      type: Object,
      default: {
        shirt: { digit: '', letter: '', date: '' },
        pants: { digit: '', letter: '', date: '' },
        suitJacket: { digit: '', letter: '', date: '' },
        shoes: { digit: '', date: '' },
      },
    },
    vehicle: { type: Boolean, default: false },
    gender: { type: String, enum: ['male', 'female'], default: 'male' },
    referer: { type: String, default: '' },
    picture: {
      type: Object,
      default: {
        url: '',
        storageName: '',
        date: '',
      },
    },
    documents: {
      type: Object,
      default: {
        idCard: {
          documentId: '',
          picture: {
            front: { url: '', storageName: '', date: '' },
            back: { url: '', storageName: '', date: '' },
          },
        },
        passport: {
          documentId: '',
          picture: {
            front: { url: '', storageName: '', date: '' },
          },
        },
        vitalCard: {
          documentId: '',
          picture: {
            front: { url: '', storageName: '', date: '' },
          },
        },
        bank: {
          documentId: '',
          picture: {
            front: { url: '', storageName: '', date: '' },
          },
        },
      },
    },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  },
  { timestamps: true },
)

export default mongoose.model('Staff', staffSchema)
