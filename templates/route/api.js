let apiRouter = function(router) {
    router.get('/api/upload', (req, res) => {
        // Get 请求的参数可以在req.query.[paramname]获取
        let {name, pwd, sex} = req.query;

        res.end(`Get File Uploaded. Name: ${name}; Password: ${pwd}; Sex: ${sex}`)
    })

    router.post('/api/upload', (req, res) => {
        // Post 请求的参数可以在req.body.[paramname]获取，使用body-parser之后可以这样获取
        let {name, pwd, sex} = req.body;

        res.end(`Post File Uploaded. Name: ${name}; Password: ${pwd}; Sex: ${sex}`)
    })
}

module.exports = apiRouter;