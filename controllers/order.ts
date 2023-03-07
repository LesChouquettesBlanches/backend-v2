/* eslint-disable no-param-reassign */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-underscore-dangle */
import { Request, Response } from 'express'
import endOfDay from 'date-fns/endOfDay'
import startOfDay from 'date-fns/startOfDay'
import dateFormat from 'date-fns/format'
import Order from '../models/order'
import Booker from '../models/booker'
import GoogleCalendar from '../clients/google/calendar'

import {
  getUpdatedFields,
  isAdmin,
  formatEventSummary,
  getEventAttendees,
  sortTeamsByHour,
} from '../utils/utils'
import mailerService from '../services/mailer'
import newOrderTemplate from '../templates/mails/admin/order/new'
import updateOrderTemplate from '../templates/mails/admin/order/update'

const create = async (req: Request, res: Response) => {
  const booker = await Booker.findOne({ user: req.body.userId }).populate(
    'user',
    'firstname lastname email',
  )

  const order = new Order({
    booker: booker._id,
    eventDate: req.body.eventDate,
    eventStatus: req.body.eventStatus,
    eventLocation: req.body.eventLocation,
    eventOrderNumber: req.body.eventOrderNumber,
    eventAddress: req.body.eventAddress,
    eventType: req.body.eventType,
    customerName: req.body.customerName,
    guestsCount: req.body.guestsCount,
    teams: req.body.teams,
    clothes: req.body.clothes,
    eventNotice: req.body.eventNotice,
    adminNotice: req.body.adminNotice,
  })
  order
    .save()
    .then(async (newOrder) => {
      if (!(await isAdmin(req.body.userId))) {
        const template = newOrderTemplate({
          booker,
          eventDate: dateFormat(new Date(newOrder.eventDate), 'dd/MM/yyyy'),
          eventLocation: newOrder.eventLocation,
          adminNotice: newOrder.adminNotice,
          url: `${process.env.BASE_ADMIN_URL}/order/${newOrder.id}`,
        })
        const mailOptions = {
          from: process.env.SMTP_SUPPORT_EMAIL,
          to: process.env.SMTP_ORDERS_EMAIL,
          subject: 'Nouvelle commande!',
          html: template,
        }

        mailerService(mailOptions)
      }
      res.status(201).json({
        message: 'Post saved successfully!',
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

const get = (req: Request, res: Response) => {
  Order.findOne({
    _id: req.params.id,
  })
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
      sortTeamsByHour(order.teams)
      res.status(200).json(order)
    })
    .catch((error) => {
      res.status(404).json({
        error,
      })
    })
}

const setStatus = (req: Request, res: Response) => {
  Order.findOne({
    _id: req.params.id,
  })
    .populate({
      path: 'booker',
      select: 'company defaultClothes',
      populate: { path: 'user', select: 'firstname lastname phone email' },
    })
    .populate({
      path: 'teams.members.staff',
      populate: { path: 'user', select: 'firstname lastname phone email' },
    })
    .then(async (order) => {
      if (order !== null) {
        if (
          (order.status && req.body.status) ||
          (!order.status && !req.body.status)
        ) {
          sortTeamsByHour(order.teams)
          res.status(200).json(order)
        }

        if (!order.status && req.body.status) {
          const googleEvent = await GoogleCalendar.createEvent(order)
          order.googleEventId = googleEvent.data.id

          const mailOptions = {
            from: process.env.SMTP_SUPPORT_EMAIL,
            subject: formatEventSummary(order),
            template: 'staff/order/new',
            context: {
              order: order.toJSON(),
              eventLink: googleEvent.data.htmlLink,
            },
          }

          const attendees = getEventAttendees(order.teams)
          if (attendees.length > 0) {
            attendees.map(async (staff) => {
              mailOptions.to = staff.email
              await mailerService(mailOptions)
            })
          }
        } else if (order.status && !req.body.status) {
          await GoogleCalendar.deleteEvent(order)
          order.googleEventId = null
        }

        order.status = req.body.status
        order.markModified('googleEventId')
        order.markModified('status')
        order.save()
        sortTeamsByHour(order.teams)
      }
      res.status(200).json(order)
    })
    .catch((error) => {
      console.log(error)
      res.status(404).json({
        success: false,
        error: "Une erreur est survenue, contacter l'administrateur",
      })
    })
}

const setArchived = (req: Request, res: Response) => {
  Order.findOne({
    _id: req.params.id,
  })
    .then(async (order) => {
      if (order !== null) {
        order.archived = req.body.archived
        order.markModified('archived')
        order.save()
        sortTeamsByHour(order.teams)
      }
      res.status(200).json(order)
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
  const order = {
    eventDate: req.body.eventDate,
    eventStatus: req.body.eventStatus,
    eventLocation: req.body.eventLocation,
    eventOrderNumber: req.body.eventOrderNumber,
    eventAddress: req.body.eventAddress,
    eventType: req.body.eventType,
    customerName: req.body.customerName,
    guestsCount: req.body.guestsCount,
    teams: req.body.teams,
    clothes: req.body.clothes,
    eventNotice: req.body.eventNotice,
    adminNotice: req.body.adminNotice,
  }
  let oldOrder = {}
  Order.findOne({ _id: req.params.id })
    .then((data) => {
      oldOrder = data
    })
    .catch((error) => {
      console.log(error)
      res.status(400).json({
        success: false,
        error: "Une erreur est survenue, contacter l'administrateur",
      })
    })

  order.googleEventId = oldOrder.googleEventId

  Order.findByIdAndUpdate({ _id: req.params.id }, order, { new: true })
    .populate({
      path: 'booker',
      select: 'company defaultClothes',
      populate: { path: 'user', select: 'firstname lastname phone email' },
    })
    .populate({
      path: 'teams.members.staff',
      populate: { path: 'user', select: 'firstname lastname phone email' },
    })
    .then(async (newOrder) => {
      if (newOrder.googleEventId !== null) {
        GoogleCalendar.updateEvent(newOrder)
      }

      if (!(await isAdmin(req.body.userId))) {
        const updatedFields = getUpdatedFields(oldOrder, newOrder)
        const template = updateOrderTemplate({
          booker: newOrder.booker,
          eventDate: dateFormat(new Date(oldOrder.eventDate), 'dd/MM/yyyy'),
          eventLocation: newOrder.eventLocation,
          adminNotice: newOrder.adminNotice,
          fieldsUpdated: updatedFields,
          url: `${process.env.BASE_ADMIN_URL}/order/${newOrder.id}`,
        })
        const mailOptions = {
          from: process.env.SMTP_SUPPORT_EMAIL,
          to: process.env.SMTP_ORDERS_EMAIL,
          subject: 'Une commande a été modifié!',
          html: template,
        }

        mailerService(mailOptions)
      }
      res.status(201).json(newOrder)
    })
    .catch((error) => {
      console.log(error.message)
      res.status(400).json({
        success: false,
        error: "Une erreur est survenue, contacter l'administrateur",
      })
    })
}

const remove = (req: Request, res: Response) => {
  Order.findOne({ _id: req.params.id }).then(async (order) => {
    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found',
      })
    }
    if (order.googleEventId !== null) {
      await GoogleCalendar.deleteEvent(order)
    }
    Order.deleteOne({ _id: req.params.id })
      .then(() => {
        res.status(200).json({
          message: 'Deleted!',
        })
      })
      .catch((error) => {
        console.log(error)
        res.status(400).json({
          success: false,
          error: "Une erreur est survenue, contacter l'administrateur",
        })
      })
  })
}

const list = (req: Request, res: Response) => {
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

  if (bodyFilters.hasOwnProperty('intervalDate')) {
    filters.eventDate = {
      $gte: startOfDay(new Date(bodyFilters.intervalDate.start)),
      $lte: endOfDay(new Date(bodyFilters.intervalDate.end)),
    }
  }

  if (bodyFilters.hasOwnProperty('createdDate')) {
    filters.createdDate = {
      $gte: startOfDay(new Date(bodyFilters.createdDate)),
      $lte: endOfDay(new Date(bodyFilters.createdDate)),
    }
  }

  if (bodyFilters.hasOwnProperty('booker')) {
    if (
      bodyFilters.booker.hasOwnProperty('active') &&
      bodyFilters.booker.active
    ) {
      filters.booker = {
        $ne: null,
      }
    }
  }

  if (
    Object.keys(filters).length === 0 &&
    Object.keys(bodySortBy).length === 0
  ) {
    sortBy.eventDate = 'desc'
  }

  Order.find({
    ...filters,
  })
    .sort(sortBy)
    .populate({
      path: 'booker',
      select: 'company defaultClothes orderColor',
      populate: { path: 'user', select: 'firstname lastname phone email' },
    })
    .populate({
      path: 'teams.members.staff',
      populate: { path: 'user', select: 'firstname lastname phone email' },
    })
    .then((orders) => {
      orders.map((order) => sortTeamsByHour(order.teams))
      res.status(200).json(orders)
    })
    .catch((error) => res.status(500).json({ error }))
}

const updateTeams = (req: Request, res: Response) => {
  Order.findByIdAndUpdate(
    { _id: req.params.id },
    { teams: req.body.teams },
    { new: true },
  )
    .then((data) => {
      res.status(201).json(data)
    })
    .catch((error) => {
      console.log(error)
      res.status(400).json({
        success: false,
        error: "Une erreur est survenue, contacter l'administrateur",
      })
    })
}

const updateTeamMembers = (req: Request, res: Response) => {
  Order.findOne({
    _id: req.params.id,
  })
    .populate({
      path: 'booker',
      select: 'company defaultClothes',
      populate: { path: 'user', select: 'firstname lastname phone email' },
    })
    .populate({
      path: 'teams.members.staff',
      populate: { path: 'user', select: 'firstname lastname phone email' },
    })
    .then(async (order) => {
      order.teams.map((team) => {
        if (team.id === req.params.teamId) {
          team.members = req.body.members
          team.markModified('members')
          order.save()
        }
        return true
      })
      await order.populate({
        path: 'teams.members.staff',
        populate: { path: 'user', select: 'firstname lastname phone email' },
      })
      sortTeamsByHour(order.teams)
      res.status(200).json(order)
    })
    .catch((error) => {
      console.log(error)
      res.status(400).json({
        success: false,
        error: "Une erreur est survenue, contacter l'administrateur",
      })
    })
}

const order = {
  create,
  update,
  remove,
  list,
  updateTeams,
  updateTeamMembers,
  get,
  setArchived,
  setStatus,
}

export default order
