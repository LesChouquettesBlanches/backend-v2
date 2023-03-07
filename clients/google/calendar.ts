const { google } = require('googleapis')

const {
  formatAddress,
  formatEventSummary,
  formatEventDescription,
  dateFormat,
} = require('../../utils/utils')

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APP_CREDENTIALS,
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.readonly',
  ],
})

const calendar = google.calendar({ version: 'v3', auth })

async function createEvent(event) {
  const googleEventResource = {
    summary: formatEventSummary(event),
    description: formatEventDescription(event),
    location: formatAddress(event.eventAddress),
    start: {
      date: dateFormat(new Date(event.eventDate), 'yyyy-MM-dd'),
    },
    end: {
      date: dateFormat(new Date(event.eventDate), 'yyyy-MM-dd'),
    },
  }
  try {
    const gEvent = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: googleEventResource,
    })
    return gEvent
  } catch (e) {
    console.log(e)
    return e
  }
}

async function updateEvent(event) {
  const googleEventResource = {
    summary: formatEventSummary(event),
    description: formatEventDescription(event),
    location: formatAddress(event.eventAddress),
    start: {
      date: dateFormat(new Date(event.eventDate), 'yyyy-MM-dd'),
    },
    end: {
      date: dateFormat(new Date(event.eventDate), 'yyyy-MM-dd'),
    },
  }

  const gEvent = await calendar.events.patch({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    eventId: event.googleEventId,
    resource: googleEventResource,
  })

  return gEvent.data
}

async function deleteEvent(event) {
  try {
    const gEvent = await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: event.googleEventId,
    })
    return gEvent.data
  } catch (e) {
    console.log(e)
    return 'already deleted'
  }
}

module.exports = { createEvent, deleteEvent, updateEvent }
