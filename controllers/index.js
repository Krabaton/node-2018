const db = require('../models/db')
const fs = require('fs')
const util = require('util')
const validation = require('../libs/validation')
const psw = require('../libs/password')
const _path = require('path')
const rename = util.promisify(fs.rename)
const unlink = util.promisify(fs.unlink)

module.exports.index = async(ctx, next) => {
  ctx.render('pages/index')
}

module.exports.myWorks = async(ctx, next) => {
  const works = db
    .getState()
    .works || []

  ctx.render('pages/my-work', {
    items: works,
    authorized: ctx.session.isAuthorized
  })
}

module.exports.uploadWork = async(ctx, next) => {
  const {projectName, projectUrl, text} = ctx.request.body
  const {name, size, path} = ctx.request.files.file

  const responseError = validation(projectName, projectUrl, text, name, size)

  if (responseError) {
    await unlink(path)
    ctx.body = responseError
  }

  let fileName = _path.join(process.cwd(), 'public', 'upload', name)
  const errUpload = await rename(path, fileName)
  if (errUpload) {
    return (ctx.body = {
      mes: 'При загрузке картинки произошла ошибка',
      status: 'Error'
    })
  }
  db
    .get('works')
    .push({
      name: projectName,
      link: projectUrl,
      desc: text,
      picture: _path.join('upload', name)
    })
    .write()
  ctx.body = {
    mes: 'Картинка успешно загружена',
    status: 'OK'
  }
}

module.exports.contactMe = async(ctx, next) => {
  ctx.render('pages/contact-me')
}

module.exports.login = async(ctx, next) => {
  ctx.render('pages/login')
}

module.exports.auth = async(ctx, next) => {

  const {login, password} = ctx.request.body
  console.log(psw.validPassword(password));
  const user = db
    .getState()
    .user

  if (user.login === login && psw.validPassword(password)) {
    ctx.session.isAuthorized = true
    ctx.body = {
      mes: 'Done',
      status: 'OK'
    }
  } else {
    ctx.body = {
      mes: 'Forbiden',
      status: 'Error'
    }
  }
}