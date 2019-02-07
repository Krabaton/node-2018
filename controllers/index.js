const dbSQL = require("../models/db");
const db = require("../models/_db-LowDB");
const fs = require("fs");
const util = require("util");
const validation = require("../libs/validation");
const psw = require("../libs/password");
const _path = require("path");
const rename = util.promisify(fs.rename);
const unlink = util.promisify(fs.unlink);
const config = require("../config");
const azure = require("azure-storage");

const azureBlobService = azure.createBlobService(
  config.storage.storageAccount,
  config.storage.accessKey
);

module.exports.index = async (ctx, next) => {
  ctx.render("pages/index");
};

module.exports.myWorks = async (ctx, next) => {
  const works = db.getState().works || [];

  ctx.render("pages/my-work", {
    items: works,
    authorized: ctx.session.isAuthorized
  });
};

module.exports.uploadWork = async (ctx, next) => {
  const { projectName, projectUrl, text } = ctx.request.body;
  const { name, size, path } = ctx.request.files.file;

  const responseError = validation(projectName, projectUrl, text, name, size);

  if (responseError) {
    await unlink(path);
    ctx.body = responseError;
  }

  let fileName = _path.join(process.cwd(), "public", "upload", name);
  const errUpload = await rename(path, fileName);
  if (errUpload) {
    return (ctx.body = {
      mes: "При загрузке картинки произошла ошибка",
      status: "Error"
    });
  }

  const response = await uploadLocalFile(
    config.storage.questionsImagesContainerName,
    name,
    fileName
  );
  const urlToInsert = `${config.storage.endpoint}${
    config.storage.questionsImagesContainerName
  }/${name}`;

  db.get("works")
    .push({
      name: projectName,
      link: projectUrl,
      desc: text,
      picture: urlToInsert
    })
    .write();

  ctx.body = response;
};

module.exports.contactMe = async (ctx, next) => {
  ctx.render("pages/contact-me");
};

module.exports.login = async (ctx, next) => {
  ctx.render("pages/login");
};

module.exports.auth = async (ctx, next) => {
  const { login, password } = ctx.request.body;
  const [err, user] = await to(
    dbSQL.raw("SELECT login, hash, salt FROM USERS WHERE login = ?", [login])
  );
  if (err) next(err);
  if (user.length === 0) {
    ctx.body = {
      mes: "User not found",
      status: "Error"
    };
    return;
  }

  if (psw.validPassword(user[0], password)) {
    ctx.session.isAuthorized = true;
    ctx.body = {
      mes: "Done",
      status: "OK"
    };
  } else {
    ctx.body = {
      mes: "Incorrect password - forbidden",
      status: "Error"
    };
  }
};

const uploadLocalFile = async (containerName, blobName, fullPath) => {
  return new Promise((resolve, reject) => {
    azureBlobService.createBlockBlobFromLocalFile(
      containerName,
      blobName,
      fullPath,
      err => {
        if (err) {
          reject({
            mes:
              "При загрузке картинки произошла ошибка Azure - " + err.message,
            status: "Error"
          });
        } else {
          resolve({
            mes: "Картинка успешно загружена",
            status: "OK"
          });
        }
      }
    );
  });
};

function to(promise) {
  return promise
    .then(data => {
      return [null, data];
    })
    .catch(err => [err]);
}
