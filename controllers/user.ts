/* eslint-disable no-param-reassign */
const endOfDay = require('date-fns/endOfDay')
const startOfDay = require('date-fns/startOfDay')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const Staff = require('../models/staff')
const Booker = require('../models/booker')
const Order = require('../models/order')
const {
  getAdminData,
  getBookerData,
  getStaffData,
  formatBookerData,
  formatStaffData,
} = require('../utils/utils')

exports.profile = (req, res) => {
  User.findOne({ _id: req.body.userId })
    .then(async (user) => {
      if (!user) {
        res.status(401).json({ error: 'Utilisateur non trouvé !' })
      }
      let data = { ...user }
      if (user.roles.includes('administrator')) {
        data = await getAdminData(user)
      } else if (user.roles.includes('booker')) {
        data = await getBookerData(user)
      } else if (user.roles.includes('staff')) {
        data = await getStaffData(user)
      }

      Object.assign(user._doc, data)
      res.status(200).json(user)
    })
    .catch((error) => {
      console.log(error)
      res.status(500).json({ error })
    })
}

exports.update = (req, res) => {
  const updatedUser = {
    login: req.body.login,
    email: req.body.email,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    phone: req.body.phone,
  }

  User.findByIdAndUpdate({ _id: req.body.userId }, updatedUser, { new: true })
    .then(async (user) => {
      if (!user) {
        res.status(401).json({ error: 'Utilisateur non trouvé !' })
      }

      let obj = { ...user }

      if (user.roles.includes('booker')) {
        const booker = await Booker.findOneAndUpdate(
          { user: user._id },
          {
            $set: {
              company: req.body.company,
              defaultClothes: req.body.defaultClothes,
            },
            new: true,
          },
        ).then((data) => data)
        obj = formatBookerData(booker)
      } else if (user.roles.includes('staff')) {
        const staff = await Staff.findOneAndUpdate(
          { user: user._id },
          {
            $set: {
              address: req.body.address,
              languages: req.body.languages,
              birth: req.body.birth,
              clothesSize: req.body.clothesSize,
              documents: req.body.documents,
              vehicle: req.body.vehicle,
              picture: req.body.picture,
              gender: req.body.gender,
            },
          },
          { new: true },
        ).then((data) => data)

        obj = formatStaffData(staff)
      }

      Object.assign(user._doc, obj)
      res.status(201).json(user)
    })
    .catch((error) => {
      if (error.codeName !== undefined && error.codeName === 'DuplicateKey') {
        res.status(401).json({ error: 'Login ou email déjà utilisé !' })
      }
      console.log(error)
      res.status(400).json({
        error: 'Une erreur est survenue, veuillez réessayer',
      })
    })
}

exports.updatePassword = (req, res) => {
  User.findOne({ _id: req.body.userId })
    .then((user) => {
      if (!user) {
        res.status(401).json({ error: 'Utilisateur non trouvé !' })
      }

      bcrypt.compare(req.body.currentPassword, user.password).then((valid) => {
        if (!valid) {
          return res.status(401).json({ error: 'Mot de passe incorrect !' })
        }
        bcrypt.hash(req.body.newPassword, 10).then((hash) => {
          user.password = hash
          user.markModified('password')
          user
            .save({ validateModifiedOnly: true })
            .then(() => res.status(201).json(true))
            .catch((error) => res.status(400).json({ error }))
        })
      })
    })
    .catch((error) => {
      console.log(error)
      res
        .status(500)
        .json({ error: 'Une erreur est survenue, veuillez réessayer' })
    })
}

exports.ordersList = async (req, res) => {
  const bodyFilters = { ...req.body.filters }
  const bodySortBy = { ...req.body.sortBy }

  const filters = {
    ...bodyFilters,
  }
  const sortBy = {
    ...bodySortBy,
  }

  if (bodyFilters.hasOwnProperty('futureOrders') && bodyFilters.futureOrders) {
    filters.eventDate = {
      $gte: startOfDay(new Date()),
    }
  }

  if (bodyFilters.hasOwnProperty('pastOrders') && bodyFilters.pastOrders) {
    filters.eventDate = {
      $lte: endOfDay(new Date()),
    }
  }

  if (bodyFilters.hasOwnProperty('eventDate')) {
    filters.eventDate = {
      $gte: startOfDay(new Date(bodyFilters.eventDate)),
      $lte: endOfDay(new Date(bodyFilters.eventDate)),
    }
  }

  if (bodyFilters.hasOwnProperty('createdDate')) {
    filters.createdDate = {
      $gte: startOfDay(new Date(bodyFilters.createdDate)),
      $lte: endOfDay(new Date(bodyFilters.createdDate)),
    }
  }

  if (
    Object.keys(filters).length === 0 &&
    Object.keys(bodySortBy).length === 0
  ) {
    sortBy.eventDate = 'desc'
  }

  const booker = await Booker.findOne({ user: req.body.userId })
  Order.find({ booker: booker._id, archived: false, ...filters })
    .sort(sortBy)
    .then((ordersList) => {
      res.status(200).json(ordersList)
    })
    .catch((error) => res.status(500).json({ error }))
}

exports.order = (req, res) => {
  Order.findOne({ _id: req.params.id })
    .populate({
      path: 'booker',
      select: 'company defaultClothes',
      populate: { path: 'user', select: 'firstname lastname' },
    })
    .populate({
      path: 'teams.members.staff',
      populate: { path: 'user', select: 'firstname lastname phone email' },
    })
    .then((order) => {
      res.status(200).json(order)
    })
    .catch((error) => res.status(500).json({ error }))
}

exports.updateOrder = (req, res) => {
  Order.findOne({ _id: req.params.id })
    .populate({
      path: 'booker',
      select: 'company defaultClothes',
      populate: { path: 'user', select: 'firstname lastname' },
    })
    .populate({
      path: 'teams.members.staff',
      populate: { path: 'user', select: 'firstname lastname phone email' },
    })
    .then((order) => {
      res.status(200).json(order)
    })
    .catch((error) => res.status(500).json({ error }))
}

exports.listUsers = (req, res) => {
  User.find()
    .then((users) => {
      res.status(200).json(users)
    })
    .catch((error) => res.status(500).json({ error }))
}

exports.findById = (req, res) => {
  User.findOne({ _id: req.params.id })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' })
      }

      res.status(200).json(user)
    })
    .catch((error) => res.status(500).json({ error }))
}

exports.updateById = (req, res) => {
  const updatedUser = {
    login: req.body.login,
    email: req.body.email,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    phone: req.body.phone,
  }

  User.findByIdAndUpdate({ _id: req.params.id }, updatedUser, { new: true })
    .then((user) => {
      if (!user) {
        res.status(401).json({ error: 'Utilisateur non trouvé !' })
      }
      let obj = { ...user }

      if (user.roles.includes('booker')) {
        const booker = Booker.findOneAndUpdate(
          { user: user._id },
          {
            $set: {
              company: req.body.company,
              orderColor: req.body.orderColor,
            },
            new: true,
          },
        ).then((data) => data)
        obj = formatBookerData(booker)
      } else if (user.roles.includes('staff')) {
        const staff = Staff.findOneAndUpdate(
          { user: user._id },
          {
            $set: { address: req.body.address, birth: req.body.birth },
            new: true,
          },
        ).then((data) => data)
        obj = formatStaffData(staff)
      }

      Object.assign(user._doc, obj)
      res.status(201).json(user)
    })
    .catch((error) => {
      if (error.codeName !== undefined && error.codeName === 'DuplicateKey') {
        res.status(401).json({ error: 'Login ou email déjà utilisé !' })
      }
      console.log(error)
      res.status(400).json({
        error: 'Une erreur est survenue, veuillez réessayer',
      })
    })
}

exports.deleteById = async (req, res) => {
  User.findOne({ _id: req.params.id })
    .then(async (user) => {
      if (!user) {
        res.status(401).json({ error: 'Utilisateur non trouvé !' })
      }
      if (!user.roles.includes('administrator')) {
        if (user.roles.includes('booker')) {
          await Booker.findOneAndDelete({ user: user._id }).then((booker) =>
            Order.updateMany({ booker: booker._id }, { booker: null }),
          )
        } else if (user.roles.includes('staff')) {
          /*
          await deleteFromStore(
            `${user.firstname}-${user.lastname}-${user._id}`,
          )
          */

          await Staff.deleteOne({ user: user._id })
        }
        user.remove()
      }

      res.status(201).json('User deleted successfully')
    })
    .catch((error) => {
      console.log(error)
      res.status(500).json({ error })
    })
}

exports.setIsActive = (req, res) => {
  User.findByIdAndUpdate(
    {
      _id: req.params.id,
    },
    { isActive: req.body.status },
    { new: true },
  )
    .then((user) => {
      res.status(200).json(user)
    })
    .catch((error) => {
      console.log(error)
      res.status(400).json({
        success: false,
        error: "Une erreur est survenue, contacter l'administrateur",
      })
    })
}
