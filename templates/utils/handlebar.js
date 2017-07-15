const handlebars = require('express-handlebars')
const extname = 'handlebars'

const instance = handlebars.create({
    defaultLayout: 'main',
    helpers: {
        block: function(name, options) {
            if(!this.block) {
                this.block = {}
            }

            this.block[name] = options.fn(this)
            return null
        }
    }
})

module.exports = { engineName: extname, viewEngine: instance.engine };