'use strict'

const inquirer = require('inquirer')
const fs = require('fs-extra')
const path = require('path')
const argv = require('minimist')(process.argv.slice(2))

const { startLoadTesting } = require('../utils/loadTesting')

function runArtillery () {
  let fileName
  let filePath
  const questions = []

  const arg = argv._.length > 0 ? argv._[0] : false
  const localSchema = argv.localSchema ? argv.localSchema : false

  if (arg && fs.existsSync(arg)) {
    fileName = arg
  } else if (arg && fs.existsSync(arg)) {
    const files = getFiles('.json')
    const options = {
      type: 'list',
      name: 'configFile',
      message: 'Config file:',
      choices: files
    }
    questions.push(options)
    filePath = arg
  } else {
    const files = getFiles('.json', true)
    if (files.length === 0) {
      console.log('> Error: There are no JSON files in this dir! ❌')
      process.exit(1)
    }
    const options = {
      type: 'list',
      name: 'configFile',
      message: 'Config file:',
      choices: files
    }
    questions.push(options)
  }

  let schemaPath = null;

  if (localSchema) {
    if (localSchema == true) { // Will show file selection dialog
      const files = [].concat(getFiles('.gql', true), getFiles('.graphql', true))
      const options = {
        type: 'list',
        name: 'localSchemaName',
        message: 'Local schema file:',
        choices: files
      }
      questions.push(options)
    } else { // filename was given from command line
      schemaPath = localSchema;
    }
  }

  inquirer.prompt(questions).then(answers => {
    fileName = fileName || answers['configFile']
    const localSchemaName = schemaPath || answers['localSchemaName'];
    console.log(`using schema file: ${localSchemaName}`);
    const configFile = filePath ? path.join(path.resolve(), filePath, fileName) : path.join(path.resolve(), fileName)

    startLoadTesting(configFile, localSchemaName)
  })
}

function getFiles(extension, withPath) {
  let files
  if (withPath) {
    files = fs.readdirSync(path.resolve())
  } else {
    files = fs.readdirSync(extension)
  }

  return files.filter(file => file.includes(extension))
}

module.exports = runArtillery
