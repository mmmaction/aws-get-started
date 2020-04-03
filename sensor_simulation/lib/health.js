// Copyright (C), Siemens AG 2020
// Licensed under the Siemens Inner Source License 1.1 or at your option any later version.

const express = require('express')

const router = express.Router()

const app = express()
let server = null

router.get('/', function (req, res, next) {
  res.status(model.status === 0 ? 200 : 500).json(model)
})

app.use('/health', router)

// Model has to be flat for CW metric filter
const model = {
  status: 0
}

module.exports = {
  setStatus: (code) => {
    model.status = code
  },

  listen: (port) => {
    server = app.listen(port, (err) => {
      if (err) {
        console.log('Healtcheck app.listen failed', err)
      }
      console.log('Healthcheck listening on port: ', port)
    })
  },

  close: () => {
    server.close()
  }
}
