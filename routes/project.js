const router = require('koa-router')();
const project = require('../controller/project');

router.prefix('/project');

router.get('/', project.getProjects);
router.post('/create', project.create);
router.get('/info/:id', project.get);
router.post('/update', project.update);
router.delete('/delete', project.delete);
router.post('/migrateOwner', project.migrateOwner);

module.exports = router;
