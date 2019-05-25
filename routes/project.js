const router = require('koa-router')();
const project = require('../controller/project');

router.prefix('/project');

router.get('/', project.getProjects);
router.get('/:id', project.getProject);
router.post('/:id/update', project.update);

module.exports = router;
