import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/user'
import Booker from '../models/booker'
import Staff from '../models/staff'
import {
  isEmail,
  getBookerData,
  getStaffData,
  getAdminData,
} from '../utils/utils'

exports.signup = (req, res) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        login: req.body.login,
        email: req.body.email,
        password: hash,
        roles: [req.body.role],
      })
      user
        .save()
        .then((newUser) => {
          if (newUser.roles.includes('booker')) {
            const booker = new Booker({
              user: newUser._id,
            })
            booker.save()
          } else if (newUser.roles.includes('staff')) {
            const staff = new Staff({
              user: newUser._id,
              referer: req.body.referer,
            })
            staff.save()
          }
          res.status(201).json(true)
        })
        .catch((e) => {
          if (e.errors.email !== undefined || e.errors.login !== undefined) {
            res.status(401).json({ error: 'Login ou email déjà utilisé' })
          }
          res.status(500).json({ e })
        })
    })
    .catch((error) => res.status(500).json({ error }))
}

exports.login = (req, res) => {
  const login = isEmail(req.body.login)
    ? { email: req.body.login }
    : { login: req.body.login }

  User.findOne(login)
    .then((user) => {
      if (!user) {
        res.status(401).json({ error: 'Identifiants incorrects !' })
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then(async (valid) => {
          if (!valid) {
            res.status(401).json({ error: 'Identifiants incorrects !' })
          }
          const token = jwt.sign(
            { userId: user._id },
            process.env.APP_SECRET_TOKEN,
            {
              expiresIn: '24h',
            },
          )

          let data = { ...user }

          if (user.roles.includes('administrator')) {
            data = await getAdminData(user)
          } else if (user.roles.includes('booker')) {
            data = await getBookerData(user)
          } else if (user.roles.includes('staff')) {
            data = await getStaffData(user)
          }
          Object.assign(user._doc, data)
          res.status(200).json({ ...user._doc, token })
        })
        .catch((error) => res.status(500).json({ error }))
    })
    .catch((error) => res.status(500).json({ error }))
}

exports.tokenVerify = (req, res) => {
  res.status(200).json(true)
}
