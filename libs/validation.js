module.exports = (projectName, url, text, name, size) => {
  let response;

  if (projectName === '') {
    response = {
      mes: 'Не указано название проекта',
      status: 'Error'
    }
  }

  if (url === '') {
    response = {
      mes: 'Не указано адрес проекта',
      status: 'Error'
    }
  }

  if (text === '') {
    response = {
      mes: 'Не указано описание проекта',
      status: 'Error'
    }
  }

  if (name === '' || size === 0) {
    response = {
      mes: 'Не загружена картинка',
      status: 'Error'
    }
  }

  return response
}