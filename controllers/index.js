// const db = require('../models/db');
const db = require("../models/_db-LowDB");
const fs = require("fs");
const streamifier = require("streamifier");
const util = require("util");
const validation = require("../libs/validation");
const psw = require("../libs/password");
const _path = require("path");
const rename = util.promisify(fs.rename);
const unlink = util.promisify(fs.unlink);
const config = require("../config");
const azure = require("azure-storage");
const mime = require("mime-types");

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
  console.log(psw.validPassword(password));
  const user = db.getState().user;

  if (user.login === login && psw.validPassword(password)) {
    ctx.session.isAuthorized = true;
    ctx.body = {
      mes: "Done",
      status: "OK"
    };
  } else {
    ctx.body = {
      mes: "Forbiden",
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
