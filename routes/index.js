const Router = require('koa-router')
const router = new Router()
const koaBody = require('koa-body')

const controllers = require('../controllers')
router.get('/', controllers.index)
router.get('/my-work', controllers.myWorks)
router.post('/my-work', koaBody({
  multipart: true,
  formidable: {
    uploadDir: process.cwd() + '/public/upload'
  }
}), controllers.uploadWork)

router.get('/contact-me', controllers.contactMe)
router.get('/login', controllers.login)
router.post('/login', koaBody(), controllers.auth)

module.exports = router