const express=require('express');
const { signup, login } = require('../controllers/user');
const { validateSignUpRequest, isRequestValidated } = require('../validator/user');

const router=express.Router();

router.post('/admin/signup', validateSignUpRequest , isRequestValidated,  signup);
router.post('/admin/signin', login);


module.exports=router;
 