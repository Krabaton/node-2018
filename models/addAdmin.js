const readline = require('readline')
const rl = readline.createInterface({input: process.stdin, output: process.stdout})
const db = require('./db.js')
const psw = require('../libs/password')

let login = ''
let hash = ''
let salt = ''
let pasaword = {}

rl.question('Login: ', answer => {
  login = answer
  rl.question('Password: ', answer => {
    password = psw.setPassword(answer)
    hash = password.hash
    salt = password.salt
    rl.close()
  })
})

rl.on('close', () => {
  db
    .set('user', {login, hash, salt})
    .write()
})