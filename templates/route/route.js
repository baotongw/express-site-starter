const router = require('express').Router();
const apiRouter = require('./api');

// 指定api router的绑定
apiRouter(router);

router.get('/', (req, res) => {
    res.render('home');
})

router.get('/get-upload', (req, res) => {
    res.render('pages/get-form');
})

router.get('/post-upload', (req, res) => {
    res.render('pages/post-form');
})

router.get('/h5upload', (req, res) => {
    res.render('pages/h5upload');
})

module.exports = router;