function typeOf(source) {
  return ({}).toString.call(source).slice(8, -1).toLowerCase()
}

module.exports = typeOf