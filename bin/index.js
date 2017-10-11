#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const child_process = require('child_process')
const color = require('../utils/color.js')

// 项目所在目录
const projectRoot = process.cwd()
// 工程所在目录
const commandRoot = path.dirname(__dirname)
const requiredModules = require('./modules')

console.log('Start to create express site.'.info)
console.log('')
console.log('1. Create Project Files'.info)
console.log('')

function cpall(templateRoot, targetRoot) {
	let templateChildren = fs.readdirSync(templateRoot)

	templateChildren.length && templateChildren.forEach(templateChild => {
		let templateChildPath = path.resolve(templateRoot, templateChild)
		let templateChildStat = fs.statSync(templateChildPath)
		
		let targetChildPath = path.resolve(targetRoot, templateChild)
		let isTargetExist = fs.existsSync(targetChildPath)

		if(templateChildStat.isDirectory()) {
			// .. create folder under the target and do cp recursion
			if(!isTargetExist) {
				fs.mkdirSync(targetChildPath)
				console.log(`[Create Folder] ${targetChildPath}`)
			}
			
			cpall(templateChildPath, targetChildPath)

		} else if (templateChildStat.isFile()) {
			// .. do copy file
			if(isTargetExist) {
				return
			}

			let content = fs.readFileSync(templateChildPath)
			let childFilePath = path.resolve(targetRoot, templateChild)
			
			fs.writeFileSync(childFilePath, content)
			console.log(`[Create File]   ${childFilePath}`)
		}
	})
}

const templateFolder = path.resolve(commandRoot, 'templates')
cpall(templateFolder, projectRoot)

console.log('')
console.log('2. Installing Modules'.info)
console.log(requiredModules.gray)
child_process.execSync('npm install ' + requiredModules + ' --save')
console.log('')
console.log('3. Run command node ./app.js to start server'.info)
console.log('')
console.log('Express Create Completed.'.finish)