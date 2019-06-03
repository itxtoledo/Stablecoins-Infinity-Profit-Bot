const fastify = require("fastify")
const fastifyStatic = require("fastify-static")
const fs = require("fs")
const Promise = require("bluebird")
const open = require("open")
const fp = require("lodash/fp")
const _ = require("lodash")
const dotenvDefaults = require("dotenv-defaults")


async function main() {
  Promise.promisifyAll(fs)

  const app = fastify()

  app.register(fastifyStatic, {
    root: __dirname
  })

  app.get("/", async (req, res) => {
    res.sendFile("config.html")
  })

  app.get("/api/config", async (req, res) => {
    const config = await loadConfig()
    const defaultConfig = await loadDefaultConfig()

    dotenvDefaults.config()

    res.send({
      config,
      defaultConfig
    })
  })
  app.post("/api/save", async (req, res) => {
    const {
      body: { config }
    } = req
    const envFileContent = _.chain(config)
      .mapKeys((value, key) => _.snakeCase(key))
      .mapKeys((value, key) => _.toUpper(key))
      .entries()
      .map(fp.join('='))
      .join('\n')
      .value()
    

    await fs.promises.writeFile('.env', envFileContent)

    
    res.send({
      success: 1,
      
    })
  })
  async function loadConfigFromPath(path) {
    const env = await fs
      .readFileAsync(path)
      .call("toString")
      .call("split", "\n")
      .map(fp.split("="))
      .then(fp.fromPairs)
      .then(fp.mapKeys(_.camelCase))
    return env
  }

  async function loadDefaultConfig() {
    return await loadConfigFromPath(".env.defaults")
  }
  async function loadMyConfig() {
    return loadConfigFromPath(".env")
  }
  async function loadConfig() {
    const env = await loadMyConfig()
    const envDefaults = await loadDefaultConfig()

    return {
      ...envDefaults,
      ...env
    }
  }
  app.listen(process.env.PORT)

  await open("http://127.0.0.1:" + process.env.PORT)
}

module.exports = main
