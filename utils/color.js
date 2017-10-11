var colors = require('colors');  

colors.setTheme({  
  input: 'grey',  
  verbose: 'cyan',  
  finish: 'red',  
  info: 'blue',  
  help: 'cyan',  
  warn: 'yellow',  
  debug: 'magenta',  
  error: 'red'
});  

module.exports = colors;