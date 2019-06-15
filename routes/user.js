const router = require('koa-router')();
const user = require('../controller/user');

router.prefix('/user');

router.post('/login', user.login);
router.post('/register', user.register);
router.get('/info/me', user.getMe);
router.get('/query', user.queryUsers);
router.get('/info/:id', user.getUser);
router.post('/info/update', user.update);
router.post('/modifyPassword', user.modifyPassword);
router.post('/resetPassword', user.resetPassword);
router.post('/forgetPassword', user.forgetPassword);

module.exports = router;
