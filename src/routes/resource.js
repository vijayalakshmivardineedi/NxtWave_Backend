const express = require('express');
const { getAllResources, createResource, getAllResourceName } = require('../controllers/resource');
const router = express.Router();

router.post('/createResource', createResource);
router.get('/getAllResources', getAllResources);
router.get('/getAllResourceNames', getAllResourceName);




module.exports = router;
