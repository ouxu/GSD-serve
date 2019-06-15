const router = require('koa-router')();
const instance = require('../controller/instance');

router.prefix('/instance');

router.get('/', instance.queryAllByPid);
router.post('/create', instance.create);
router.get('/info/:id', instance.get);
router.post('/update', instance.update);
router.delete('/delete', instance.delete);
router.post('/migrateOwner', instance.migrateOwner);
router.post('/updateItem', instance.updateItem);

module.exports = router;
