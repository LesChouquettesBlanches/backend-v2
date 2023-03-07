/* eslint-disable no-plusplus */
const diff = require('deep-diff')
const dateFormat = require('date-fns/format')
const { getHours, getMinutes, compareAsc } = require('date-fns')
const frLocale = require('date-fns/locale/fr')
const User = require('../models/user')
const Booker = require('../models/booker')
const Staff = require('../models/staff')

async function isAdmin(userId) {
  const result = await User.findById(userId)
  const user = result.toObject()

  return user.roles.includes('administrator')
}

async function getAdminData(user) {
  const booker = await Booker.findOne({ user }).then((data) => {
    let response = {}
    if (data) {
      response = {
        company: data.company,
        defaultClothes: data.defaultClothes,
        orderColor: data.orderColor,
      }
    }
    return response
  })
  const staff = await Staff.findOne({ user }).then((data) => {
    let response = {}
    if (data) {
      response = {
        birth: data.birth,
        address: data.address,
        languages: data.languages,
        clothesSize: data.clothesSize,
        vehicle: data.vehicle,
        bookerName: data.bookerName,
        picture: data.picture,
        documents: data.documents,
        gender: data.gender,
        referer: data.referer,
      }
    }
    return response
  })
  const response = { ...booker, ...staff }
  return response
}

async function getBookerData(user) {
  const booker = await Booker.findOne({ user }).then((data) => {
    let response = {}
    if (data) {
      response = {
        company: data.company,
        defaultClothes: data.defaultClothes,
        orderColor: data.orderColor,
      }
    }
    return response
  })
  return booker
}

async function getStaffData(user) {
  const staff = await Staff.findOne({ user }).then((data) => {
    let response = {}
    if (data) {
      response = {
        birth: data.birth,
        address: data.address,
        languages: data.languages,
        clothesSize: data.clothesSize,
        vehicle: data.vehicle,
        bookerName: data.bookerName,
        picture: data.picture,
        documents: data.documents,
        gender: data.gender,
        referer: data.referer,
      }
    }
    return response
  })
  return staff
}

function formatBookerData(booker) {
  let format = {}
  if (booker) {
    format = {
      company: booker.company,
      defaultClothes: booker.defaultClothes,
      orderColor: booker.orderColor,
    }
  }
  return format
}

function formatStaffData(staff) {
  let format = {}
  if (staff) {
    format = {
      birth: staff.birth,
      address: staff.address,
      languages: staff.languages,
      clothesSize: staff.clothesSize,
      vehicle: staff.vehicle,
      bookerName: staff.bookerName,
      picture: staff.picture,
      documents: staff.documents,
      gender: staff.gender,
      referer: staff.referer,
    }
  }
  return format
}

function isEmail(email) {
  const regex = /\S+@\S+\.\S+/
  return regex.test(email)
}

function formatAddress(address) {
  return `${address.street} ${address.zipCode} ${address.city} ${address.country}`
}

function formatEventClothes(clothes) {
  let clothesDesc = ''
  if (clothes.whiteShirt !== undefined && clothes.whiteShirt) {
    if (clothesDesc.length > 0) {
      clothesDesc += ' + chemise blanche'
    } else {
      clothesDesc += 'Chemise blanche'
    }
  }
  if (clothes.blackShirt !== undefined && clothes.blackShirt) {
    if (clothesDesc.length > 0) {
      clothesDesc += ' + chemise noire'
    } else {
      clothesDesc += 'Chemise noire'
    }
  }
  if (clothes.bowTie !== undefined && clothes.bowTie) {
    if (clothesDesc.length > 0) {
      clothesDesc += ' + noeud papillon'
    } else {
      clothesDesc += 'Noeud papillon'
    }
  }
  if (clothes.suitJacket !== undefined && clothes.suitJacket) {
    if (clothesDesc.length > 0) {
      clothesDesc += ' + veste noire'
    } else {
      clothesDesc += 'Veste noire'
    }
  }
  if (clothes.tie !== undefined && clothes.tie) {
    if (clothesDesc.length > 0) {
      clothesDesc += ' + cravate noire'
    } else {
      clothesDesc += 'Cravate noire'
    }
  }
  if (clothes.vest !== undefined && clothes.vest) {
    if (clothesDesc.length > 0) {
      clothesDesc += ' + gilet noir'
    } else {
      clothesDesc += 'Gilet noir'
    }
  }

  return clothesDesc.toUpperCase()
}

function formatEventSummary(event) {
  return `ANDY ${dateFormat(
    new Date(event.eventDate),
    'dd/MM/yyyy',
  )} ${event.booker.company.toUpperCase()}`
}

function formatTeam(team) {
  const from = dateFormat(new Date(team.from), 'HH:mm')
  const to = dateFormat(new Date(team.to), 'HH:mm')

  return `${team.quantity} ${team.type} de ${from} à ${to}`
}

function formatTeamGoogleEvent(teams, forMail = false) {
  const format = teams
    .map((team) => {
      const from = dateFormat(team.from, 'HH:mm')
      const to = dateFormat(team.to, 'HH:mm')
      const type = team.type === 'Maître d’hôtel' ? 'MDH' : team.type

      let html = `<strong>HORAIRE : </strong>${
        team.quantity
      } ${type.toUpperCase()} DE ${from} À ${to}${
        team.notice !== undefined && team.notice !== ''
          ? ` (${team.notice})`
          : ''
      }`

      if (forMail) {
        html = `<strong><span style="text-decoration: underline;">${
          team.quantity
        } ${type.toUpperCase()} DE ${from} À ${to}</span>${
          team.notice !== undefined && team.notice !== ''
            ? ` (${team.notice})`
            : ''
        }</strong>`
      }

      html += '<ol>'

      let count = 0
      if (
        team.members !== undefined &&
        team.members !== null &&
        team.members.length > 0
      ) {
        team.members.forEach((member) => {
          function getStaff() {
            let staff = `<li>${member.staff.user.firstname.toUpperCase()} ${member.staff.user.lastname.toUpperCase()}`

            if (
              member.notice !== undefined &&
              member.notice !== null &&
              member.notice !== ''
            ) {
              staff += ` (${member.notice})`
            }

            staff += '</li>'

            return staff
          }
          if (member.staff !== undefined && member.staff !== null) {
            html += getStaff()
            count++
          }
        })
      }

      while (count < team.quantity) {
        html += `<li></li>`
        count++
      }

      html += '</ol>'

      return html
    })
    .join('')

  return format
}

function formatEventStatus(status) {
  if (status === null) return 'En attente'
  if (status) return 'Validé'
  if (!status) return 'Option'
  return 'Non défini'
}

function formatEventDescription(event) {
  const html =
    `<div>` +
    `<strong>LIEU : </strong>${event.eventLocation.toUpperCase()}<br />` +
    `<strong>COMMERCIAL : </strong>${event.booker.user.firstname.toLowerCase()} ${event.booker.user.lastname.toLowerCase()}<br />` +
    `<strong>REFERENCE : </strong>${event.eventOrderNumber.toLowerCase()}<br />` +
    `<strong>ETAT / NB DE PAX: </strong>${formatEventStatus(
      event.eventStatus,
    ).toLowerCase()} / ${event.guestsCount}<br />` +
    `<strong>CLIENT / ÉVÈNEMENT : </strong>${event.customerName.toLowerCase()} ${event.eventType.toLowerCase()}<br />` +
    `<strong>TENUE : </strong>${formatEventClothes(event.clothes)}<br />` +
    `<strong>INFO SUP : </strong>${event.eventNotice.toUpperCase()}<hr />${formatTeamGoogleEvent(
      event.teams,
    )}</div>`

  return html
}

function formatAttendeesDescription(event) {
  const html =
    `<div>` +
    `<strong>SOCIÉTÉ : </strong>${event.booker.company.toUpperCase()}<br />` +
    `<strong>LIEU : </strong>${event.eventLocation.toUpperCase()}<br />` +
    `<strong>ADRESSE : </strong>${formatAddress(event.eventAddress)}<br />` +
    `<strong><span style="font-size: 10px">COMMERCIAL : </strong><span style="font-size: 10px">${event.booker.user.firstname.toLowerCase()} ${event.booker.user.lastname.toLowerCase()}</span><br />` +
    `<strong>ETAT / NB DE PAX: </strong>${formatEventStatus(
      event.eventStatus,
    ).toLowerCase()} / ${event.guestsCount}<br />` +
    `<strong>CLIENT / ÉVÈNEMENT : </strong>${event.customerName.toLowerCase()} / ${event.eventType.toLowerCase()}<br />` +
    `<strong>TENUE : ${formatEventClothes(event.clothes[0])}</strong><br />` +
    `<strong>INFO SUP : ${event.eventNotice.toUpperCase()}</strong><hr />${formatTeamGoogleEvent(
      event.teams,
      true,
    )}</div>`

  return html
}

function getEventTime(event) {
  let minTime = ''
  let maxTime = ''
  const { eventDate } = event

  event.teams.map((team, index) => {
    const fromTime = new Date(team.from)
    fromTime.setDate(eventDate.getDate())
    fromTime.setMonth(eventDate.getMonth())
    fromTime.setFullYear(eventDate.getFullYear())

    const toTime = new Date(team.to)
    toTime.setDate(eventDate.getDate())
    toTime.setMonth(eventDate.getMonth())
    toTime.setFullYear(eventDate.getFullYear())

    if (index === 0) {
      minTime = fromTime
      maxTime = toTime
    } else {
      if (fromTime < minTime) {
        minTime = fromTime
      }
      if (toTime > maxTime) {
        maxTime = toTime
      }
    }
  })

  const eventTime = {
    minTime,
    maxTime,
  }

  return eventTime
}

function getUpdatedFields(source, newObj) {
  const differences = diff.diff(source, newObj)
  const updatedFields = differences.map((item) => {
    const obj = {}
    if (item.kind === 'E') {
      switch (item.path[1]) {
        case 'eventAddress':
          Object.assign(obj, {
            field: item.path[1],
            from: formatAddress(source.eventAddress),
            to: formatAddress(newObj.eventAddress),
          })

          break
        case 'teams':
          if (item.path[3] === '_doc') {
            Object.assign(obj, {
              field: item.path[1],
              from: source.teams[item.path[2]],
              to: newObj.teams[item.path[2]],
            })
          }

          break
        case 'clothes':
          Object.assign(obj, {
            field: item.path[1],
            from: source.clothes,
            to: newObj.clothes,
          })

          break
        default:
          if (item.path[1] !== 'updatedAt') {
            Object.assign(obj, {
              field: item.path[1],
              from: item.lhs,
              to: item.rhs,
            })
          }

          break
      }
    }
    if (item.kind === 'A') {
      if (item.path[1] === 'teams') {
        Object.assign(obj, {
          field: 'newMember',
          member: newObj.teams[item.index],
        })
      }
    }
    return obj
  })

  const result = updatedFields.filter(
    (obj) => !(obj && Object.keys(obj).length === 0),
  )

  return result
}

function getEventAttendees(teams) {
  const attendees = []

  if (teams !== undefined && teams !== null && teams.length > 0) {
    teams.map((team) => {
      if (
        team.members !== undefined &&
        team.members !== null &&
        team.members.length > 0
      ) {
        team.members.map((member) => {
          if (member.staff !== undefined && member.staff !== null) {
            attendees.push({ email: member.staff.user.email })
          }
        })
      }
    })
  }

  return attendees
}

function getPublishEventLink(eventLink) {
  const eid = eventLink.split('?eid=')[1]
  return `https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=${eid}&tmsrc=${process.env.GOOGLE_CALENDAR_ID}`
}

function sortTeamsByHour(teams) {
  teams.sort((t1, t2) => {
    const fromA = new Date(t1.from)
    const timeA = new Date()
    timeA.setHours(getHours(fromA))
    timeA.setMinutes(getMinutes(fromA))
    const fromB = new Date(t2.from)
    const timeB = new Date()
    timeB.setHours(getHours(fromB))
    timeB.setMinutes(getMinutes(fromB))
    return compareAsc(timeA, timeB)
  })
}

module.exports = {
  formatAddress,
  formatEventSummary,
  formatEventDescription,
  formatEventStatus,
  getEventTime,
  getUpdatedFields,
  formatEventClothes,
  formatTeam,
  dateFormat,
  isAdmin,
  getEventAttendees,
  formatAttendeesDescription,
  getPublishEventLink,
  frLocale,
  isEmail,
  getAdminData,
  getBookerData,
  getStaffData,
  formatBookerData,
  formatStaffData,
  sortTeamsByHour,
}
