const typeOf = require('./typeOf')

function useState(state) {
  validateState(state)

  return [state, set(state)]

  function set(from) {
    return to => {
      for (let key in to) {
        from[key] = to[key]
      }
    }
  }

  function validateState(state) {
    if (typeOf(state) !== 'object') throw new Error('State must be a object')
  }
}

module.exports = useState