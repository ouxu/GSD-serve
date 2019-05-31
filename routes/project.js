const router = require('koa-router')();
const project = require('../controller/project');

router.prefix('/project');

router.get('/', project.getProjects);
router.post('/create', project.createProject);
router.get('/info/:id', project.getProject);

module.exports = router;
