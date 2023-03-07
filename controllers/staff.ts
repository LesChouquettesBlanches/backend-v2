import { Request, Response } from 'express'
import { uploadToStore, deleteFromStore } from '../clients/google/storage'
import processFile from '../middlewares/upload'
import Staff from '../models/staff'
import User from '../models/user'

async function deleteDocument(document, userId) {
  const staff = await Staff.findOne({ user: userId })
  let documentToDelete = ''

  if (document === 'photo') {
    documentToDelete = staff.picture.storageName
  } else if (document === 'idCardBack') {
    documentToDelete = staff.documents.idCard.picture.back.storageName
  } else if (document === 'idCardFront') {
    documentToDelete = staff.documents.idCard.picture.front.storageName
  } else {
    documentToDelete = staff.documents[document].picture.front.storageName
  }

  if (
    documentToDelete !== undefined &&
    documentToDelete !== null &&
    documentToDelete !== ''
  ) {
    try {
      await deleteFromStore(documentToDelete)
    } catch (e) {
      console.log(e)
    }
  }
}

async function saveDocument(type, userId, document) {
  let documentType = type
  if (documentType === 'photo') {
    await Staff.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          picture: {
            url: document.publicUrl,
            date: new Date(),
            storageName: document.fileName,
          },
        },
      },
    )
  } else {
    Staff.findOne({ user: userId }).then((staff) => {
      if (documentType === 'idCardFront') {
        documentType = 'idCard'
        staff.documents.idCard.picture.front.url = document.publicUrl
        staff.documents.idCard.picture.front.storageName = document.fileName
        staff.documents.idCard.picture.front.date = new Date()
      } else if (documentType === 'idCardBack') {
        documentType = 'idCard'
        staff.documents.idCard.picture.back.url = document.publicUrl
        staff.documents.idCard.picture.back.storageName = document.fileName
        staff.documents.idCard.picture.back.date = new Date()
      } else {
        staff.documents[documentType].picture.front.url = document.publicUrl
        staff.documents[documentType].picture.front.storageName =
          document.fileName
        staff.documents[documentType].picture.front.date = new Date()
      }
      staff.markModified('documents')
      staff.save()
    })
  }
}

const create = (req: Request, res: Response) => {
  const newStaff = new Staff({
    user: req.body.userId,
    birthdate: req.body.birthdate,
    address: req.body.address,
    language: req.body.language,
    clothesSize: req.body.clothesSize,
    vehicle: req.body.vehicle,
    bookerName: req.body.bookerName,
    picture: req.body.picture,
    document: req.body.document,
  })
  newStaff
    .save()
    .then((staff) => {
      res.status(201).json({
        staff,
      })
    })
    .catch((error) => {
      console.log(error)
      res.status(400).json({
        success: false,
        error: "Une erreur est survenue, contacter l'administrateur",
      })
    })
}

const updateByid = (req: Request, res: Response) => {
  Staff.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        address: req.body.address,
        languages: req.body.languages,
        birth: req.body.birth,
        clothesSize: req.body.clothesSize,
        documents: req.body.documents,
        vehicle: req.body.vehicle,
        picture: req.body.picture,
      },
    },
    { new: true },
  )
    .populate('user')
    .then((staff) => {
      if (!staff) {
        res.status(401).json({ success: false, error: 'Employé non trouvé !' })
      }
      res.status(201).json(staff)
    })
    .catch((error) => {
      console.log(`Update employé error - ${error}`)
      res.status(400).json({
        success: false,
        error: 'Une erreur est survenue ! veuillez réessayer',
      })
    })
}

const uploadDocument = async (req: Request, res: Response) => {
  await processFile(req, res)
  if (!req.file) {
    res.status(400).json({ success: false, error: 'File not found' })
  }

  const user = await User.findById(req.auth.userId)
  const fullName = `${user.firstname.split(' ').join('-')}-${user.lastname
    .split(' ')
    .join('-')}`

  await deleteDocument(req.params.document, user.id)

  const upload = await uploadToStore(
    `user/${fullName.toLowerCase()}-${user.id}/documents/${
      req.params.document === 'idCardFront' ||
      req.params.document === 'idCardBack'
        ? 'idCard'
        : req.params.document
    }/`,
    req.file,
  )

  if (upload.success !== undefined && !upload.success) {
    res.status(400).json({ success: false, error: upload.error })
  }

  await saveDocument(req.params.document, user.id, upload)

  res.status(201).json({ success: true, publicUrl: upload.publicUrl })
}

const list = (req: Request, res: Response) => {
  const bodyFilters = { ...req.body.filters }

  Staff.find()
    .populate('user')
    .then((staffs) => {
      let response = staffs
      if (
        bodyFilters.user !== undefined &&
        bodyFilters.user.isActive !== undefined
      ) {
        response = staffs.filter((staff) => staff.user.isActive)
      }
      res.status(200).json(response)
    })
    .catch((error) => res.status(500).json({ error }))
}

const get = (req: Request, res: Response) => {
  Staff.findOne({
    _id: req.params.id,
  })
    .populate('user')
    .then((staff) => {
      res.status(200).json(staff)
    })
    .catch((error) => {
      res.status(404).json({
        success: false,
        error,
      })
    })
}

const uploadForStaff = async (req: Request, res: Response) => {
  await processFile(req, res)
  if (!req.file) {
    res.status(400).json({ success: false, error: 'File not found' })
  }

  const staff = await Staff.findById(req.params.id).populate('user')
  const fullName = `${staff.user.firstname
    .split(' ')
    .join('-')}-${staff.user.lastname.split(' ').join('-')}`

  await deleteDocument(req.params.document, staff.user._id)

  const upload = await uploadToStore(
    `user/${fullName.toLowerCase()}-${staff.user._id}/documents/${
      req.params.document === 'idCardFront' ||
      req.params.document === 'idCardBack'
        ? 'idCard'
        : req.params.document
    }/`,
    req.file,
  )

  if (upload.success !== undefined && !upload.success) {
    res.status(400).json({ success: false, error: upload.error })
  }

  await saveDocument(req.params.document, staff.user._id, upload)

  res.status(201).json({ success: true, publicUrl: upload.publicUrl })
}

const staff = { create, get, list, updateByid, uploadForStaff, uploadDocument }

export default staff
