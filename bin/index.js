#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const child_process = require('child_process')

// 项目所在目录
const projectRoot = process.cwd()
// 工程所在目录
const commandRoot = path.dirname(__dirname)

console.log('Start to create express site.')
console.log('')
console.log('1. Create Project Files')
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
console.log('2. Installing Modules')
child_process.execSync('npm install --save express body-parser compress connect cookie-parser cookie-session csurf express-handlebars')
console.log('')
console.log('3. Run command npm start to start server')
console.log('')
console.log('Express Create Completed.')