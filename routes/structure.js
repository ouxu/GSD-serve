const router = require('koa-router')();
const structure = require('../controller/structure');

router.prefix('/structure');

router.get('/', structure.getStructures);
router.post('/create', structure.create);
router.get('/info/:id', structure.get);
router.post('/update', structure.update);
router.delete('/delete', structure.delete);
router.post('/migrateOwner', structure.migrateOwner);

module.exports = router;
