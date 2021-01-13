
const middleware = {
  headers: require('./modules/headers'),
  // login:   require('./modules/login'),
}

function init({ app }) {
  for (let key in middleware) {
    app.use(middleware[ key ])
  }
}

module.exports = {
  init,
}
