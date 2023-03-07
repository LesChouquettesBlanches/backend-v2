import { Request, Response } from 'express'
import Booker from '../models/booker'

const create = (req: Request, res: Response) => {
  const newBooker = new Booker({
    user: req.body.userId,
    defaultClothes: req.body.defaultClothes,
    company: req.body.company,
    orderColor: req.body.orderColor,
  })
  newBooker
    .save()
    .then((booker) => {
      res.status(201).json({
        booker,
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

const update = (req: Request, res: Response) => {
  const booker = {
    defaultClothes: req.body.defaultClothes,
    company: req.body.company,
    orderColor: req.body.orderColor,
  }

  Booker.findByIdAndUpdate({ user: req.body.userId }, booker, { new: true })
    .then((data) => {
      if (!data) {
        res.status(401).json({ success: false, error: 'Booker non trouvé !' })
      }

      res.status(201).json(data)
    })
    .catch((error) => {
      console.log(error)
      res.status(400).json({
        success: false,
        error: 'Une erreur est survenue, veuillez réessayer',
      })
    })
}

const list = (req: Request, res: Response) => {
  Booker.find()
    .populate('user')
    .then((bookers) => {
      res.status(200).json(bookers)
    })
    .catch((error) => res.status(500).json({ success: false, error }))
}

const get = (req: Request, res: Response) => {
  Booker.findOne({
    _id: req.params.id,
  })
    .populate('user')
    .then((booker) => {
      res.status(200).json(booker)
    })
    .catch((error) => {
      res.status(404).json({
        success: false,
        error,
      })
    })
}

const updateByid = (req: Request, res: Response) => {
  Booker.findByIdAndUpdate(req.params.id, {
    $set: {
      company: req.body.company,
      orderColor: req.body.orderColor,
      defaultClothes: req.body.defaultClothes,
    },
    new: true,
  })
    .populate('user')
    .then((booker) => {
      if (!booker) {
        res.status(401).json({ success: false, error: 'Booker non trouvé !' })
      }
      res.status(201).json(booker)
    })
    .catch((error) => {
      console.log(`Update booker error - ${error}`)
      res.status(400).json({
        success: false,
        error: 'Une erreur est survenue ! veuillez réessayer',
      })
    })
}

const booker = { create, update, list, get, updateByid }

export default booker
