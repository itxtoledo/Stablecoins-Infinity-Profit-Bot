const _ = require("lodash")
const typeOf = require("./typeOf")

function beautifulLog(options, ...params) {
  const { hasOpeningBars = true, clearConsole = true, ...source } = options

  if (clearConsole) console.clear()
  if (hasOpeningBars) printBar()

  for (let name in source) {
    const value = source[name]

    const title = createTitle(name)

    console.log(
      title,
      is("object")(value) ? prepareObjectToLog(value) : value
    )
  }
  function is(type) {
    return source => typeOf(source) === type
  }

  if (params.length) console.log(...params)

  printBar()
  function printBar() {
    console.log("==========================================")
  }
  function createTitle(name) {
    const preparedName = _.upperCase(name)

    const amountDots = 13 - preparedName.length
    const dots = ".".repeat(amountDots > 0 && amountDots)

    return [preparedName, dots, ":"].join("")
  }
  function prepareObjectToLog(source) {
    return _.chain(source)
      .mapKeys((value, key) => _.upperCase(key))
      .value()
  }
}

module.exports = beautifulLog