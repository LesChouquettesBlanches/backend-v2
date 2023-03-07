import express from 'express'
import nodemailer from 'nodemailer'
import hbs from 'nodemailer-express-handlebars'
import path from 'path'
import {
  dateFormat,
  frLocale,
  getPublishEventLink,
  formatAddress,
  formatEventStatus,
  formatEventClothes,
} from '../utils/utils'

const viewPath = path.resolve('./templates/mails/')
const partialsPath = path.resolve('./templates/mails/partials')

const transport = {
  // this is the authentication for sending email.
  service: 'gmail',
  auth: {
    user: process.env.SMTP_BASE_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
}

const transporter = nodemailer.createTransport(transport)
transporter.verify((error) => {
  if (error) {
    // if error happened code ends here
    console.error(error)
    return false
  }
  return true
})

transporter.use(
  'compile',
  hbs({
    viewEngine: {
      extName: '.handlebars',
      layoutsDir: viewPath,
      defaultLayout: 'layout.handlebars',
      partialsDir: partialsPath,
      express,
      helpers: {
        dateFormat(date, format = 'dd/MM/yyyy') {
          return dateFormat(new Date(date), format, {
            locale: frLocale,
          })
        },
        getEventLink(link) {
          return getPublishEventLink(link)
        },
        formatAddress(address) {
          return formatAddress(address)
        },
        formatClothes(clothes) {
          return formatEventClothes(clothes)
        },
        formatEventStatus(eventStatus) {
          return formatEventStatus(eventStatus).toLowerCase()
        },
        fillList(team) {
          let count = 0
          let list = ''
          team.members.forEach((member) => {
            if (member.staff === undefined || member.staff === null) count += 1
          })

          while (count < team.quantity) {
            list += `<li></li>`
            count += 1
          }

          return list
        },
        fillStaff(staff) {
          if (staff) {
            return `${staff.user.firstname.toUpperCase()} ${staff.user.lastname.toUpperCase()}${
              staff.notice !== undefined && staff.notice !== ''
                ? `(${staff.notice})`
                : ''
            }${staff.isReferent ? `${staff.user.phone}` : ''}`
          }
          return ''
        },
        upperCase(string) {
          return string.toLowerCase()
        },
        lowerCase(string) {
          return string.toLowerCase()
        },
      },
    },
    viewPath,
    extName: '.handlebars',
  }),
)

const sendEmail = async (mailOptions) => {
  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.log(`mailerror: ${err}`)
      return false
    }
    return true
  })
}

export default sendEmail
