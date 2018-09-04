const Koa = require('koa')
const app = new Koa()
const fs = require('fs')
const static = require('koa-static')
const session = require('koa-session')
const Pug = require('koa-pug')
const pug = new Pug({
  viewPath: './views', pretty: false, basedir: './views', noCache: true, app: app // equals to pug.use(app) and app.use(pug.middleware)
})
const errorHandler = require('./libs/error')
const config = require('./config')

app.use(static('./public'))

app.use(errorHandler)
app.on('error', (err, ctx) => {
  ctx.render('error', {
    status: ctx.response.status,
    error: ctx.response.message
  })
});

const router = require('./routes')

app
  .use(session(config.session, app))
  .use(router.routes())
  .use(router.allowedMethods())

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    if (!fs.existsSync(config.upload)) {
      fs.mkdirSync(config.upload)
    }
    console.log(`Server start ${PORT}`);
  })
} else {
  module.exports = app
}