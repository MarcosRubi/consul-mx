const chrome = require('chrome-aws-lambda')
require('dotenv').config()

let puppeteer
let emailEnviado = false

process.env.AWS_LAMBDA_FUNCTION_VERSION
  ? (puppeteer = require('puppeteer-core'))
  : (puppeteer = require('puppeteer'))

const Vendor = {
  getConsular: (req, res) => {
    (async () => {
      let options = { headless: false }
      if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
        options = {
          args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
          defaultViewport: chrome.defaultViewport,
          executablePath: await chrome.executablePath,
          headless: true,
          ignoreHTTPSErrors: true
        }
      }
      try {
        // Abrimos una instancia del puppeteer y accedemos a la url
        const browser = await puppeteer.launch(options)
        let page = await browser.newPage()

        await page.goto('https://citas.sre.gob.mx/')

        await page.waitForSelector('.btn')
        const elements = await page.$$('.btn')
        await elements[1].click()

        page = await browser.newPage()
        await page.goto('https://citas.sre.gob.mx/')

        await page.waitForSelector('[name="email"]')
        await page.type('[name="email"]', 'danielhernandez9980@gmail.com')

        await page.waitForSelector('[name="password"]')
        await page.type('[name="password"]', 'Dan1elherdez$.')

        const checkboxes = await page.$$('input[type="checkbox"]')
        await checkboxes[1].click()

        await page.waitForSelector('.modal-body a')
        await page.click('.modal-body a')

        await page.waitForSelector('.btn.btn-primary.pull-right')
        await page.click('.btn.btn-primary.pull-right')

        await page.waitForSelector('a.btn-primary')
        setTimeout(() => {
          page.click('a.btn-primary')
        }, 2000)

        await page.waitForSelector('.modal-body a')
        setTimeout(() => {
          page.click('.modal-body a')
        }, 2000)

        await page.waitForSelector('input[placeholder="--Selecciona--"]')
        setTimeout(() => {
          page.click('input[placeholder="--Selecciona--"]')
          const isTextPresent = page.evaluate(() => {
            const ul = document.querySelector('ul#vs3__listbox')
            return ul.textContent.includes(
              'No se encontraron oficinas con disponibilidad'
            )
          })

          if (!isTextPresent && !emailEnviado) {
            sendEmail()
            emailEnviado = true
          }
          setTimeout(() => {
            page.close()
            browser.close()
          }, 2000)
        }, 10000)

        getHeaders(res)

        // Cerramos el puppeteer
      } catch (error) {
        console.error(error)
      }
    })()
  }
}

const getHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
}

const sendEmail = async () => {
  const apiKey = process.env.SENDGRID_API_KEY // Reemplaza con tu propia clave de API de SendGrid
  const url = 'https://api.sendgrid.com/v3/mail/send'

  const data = {
    personalizations: [
      {
        to: [
          {
            email: process.env.EMAIL1 // Reemplaza con la dirección de correo electrónico del destinatario
          },
          {
            email: process.env.EMAIL2 // Agrega otro correo electrónico
          },
          {
            email: process.env.EMAIL3 // Agrega otro correo electrónico
          },
          {
            email: process.env.EMAIL4 // Agrega otro correo electrónico
          }
        ],
        subject: 'Consulado citas disponible' // Reemplaza con el asunto del correo electrónico
      }
    ],
    from: {
      email: process.env.EMAIL_FROM // Reemplaza con la dirección de correo electrónico del remitente
    },
    content: [
      {
        type: 'text/plain',
        value: 'Eu, el consulado tiene habilitado realizar citas, que haces perdiendo el tiempo leyendo esto?.' // Reemplaza con el contenido del correo electrónico
      }
    ]
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (response.ok) {
    console.log('El correo electrónico ha sido enviado')
  } else {
    console.error('No se ha podido enviar el correo electrónico')
  }
}

module.exports = Vendor
