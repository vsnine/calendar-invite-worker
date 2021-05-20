import { google, outlook, office365, yahoo, ics } from "calendar-link";
import template from "./template"
/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response rather
 *    than the default 404.html page.
 */
const DEBUG = false

addEventListener('fetch', event => {
  try {
    event.respondWith(handleEvent(event))
  } catch (e) {
    if (DEBUG) {
      return event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500,
        }),
      )
    }
    event.respondWith(new Response('Internal Error', { status: 500 }))
  }
})

async function handleEvent(event) {
  if (event.request.url.includes("favicon.ico")) {
    return new Response('Not Found', { status: 404 })
  }
  const url = new URL(event.request.url)
  const { searchParams } = new URL(event.request.url)
  let options = {}

  try {
    let html_content = ""
    if (searchParams.get('title')) {
    const invite = {
      title: searchParams.get('title'),
      description: searchParams.get('desc'),
      start: decodeURI(searchParams.get('start')),
      duration: [searchParams.get('dur'), searchParams.get('unit')],
    };
    
    // Then fetch the link
    var goog = google(invite); // https://calendar.google.com/calendar/render...
    var outl = outlook(invite); // https://outlook.live.com/owa/...
    var o365 = office365(invite); // https://outlook.office.com/owa/...
    var yah = yahoo(invite); // https://calendar.yahoo.com/?v=60&title=...
    var ics_ = ics(invite); // standard ICS file based on https://icalendar.or

    html_content = "<h2>Calendar Link Generator</h2>"
    html_content += "<p>Click the appropriate link below to receive your invitation!</p>"
    html_content += "<div><a href=\"" + goog + "\" target=\"_blank\">Google Calendar Link</a></div><br />"
    html_content += "<div><a href=\"" + outl + "\" target=\"_blank\">Outlook Calendar Link</a></div><br />"
    html_content += "<div><a href=\"" + o365 + "\" target=\"_blank\">Office 365 Calendar Link</a></div><br />"
    html_content += "<div><a href=\"" + yah + "\" target=\"_blank\">Yahoo Calendar Link</a></div><br />"
    html_content += "<div><a href=\"" + ics_ + "\" target=\"_blank\">ICS Calendar Link</a></div>"
    html_content += "<br /><a href=\"/\">Reset</a>"
  } else {
    html_content = "<h2>Calendar Link Generator</h2>"
    html_content += "<p>This worker uses the following parameters to generate the calendar links</p>"
    html_content += "<ul><li>title: the title/subject of the invitation</li>"
    html_content += "<li>desc: event description</li>"
    html_content += "<li>start: start time in ISO timestamp</li>"
    html_content += "<li>dur: duration of the event</li>"
    html_content += "<li>unit: time units for the duration (hours, minutes)</li></ul>"
    html_content += "<p>Uses the <a href=\"https://www.npmjs.com/package/calendar-link\">calendar-link</a> library.<br />"
    html_content += "<a href=\"" + event.request.url + "?title=Invite%20To%20The%20Party&desc=See%20you%20at%20the%20party%2C%20pal%21&start=2019-12-29%2018%3A00%3A00%20%2B0100&dur=30&unit=minutes\">Click here for a sample.</a></p>"
  }

    // allow headers to be altered
    const response = new Response(template(html_content))

    response.headers.set('Content-Type', 'text/html')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    /*response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Referrer-Policy', 'unsafe-url')
    response.headers.set('Feature-Policy', 'none')*/

    return response

  } catch (e) {
    if (DEBUG) {
      return event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500,
        }),
      )
    }
    event.respondWith(new Response('Internal Error', { status: 500 }))
  }
}
