const express = require('express');
const controller = require('../controllers/agroController');
const {isGuest, authenticated} = require('../middlewares/auth');
const { logInLimiter } = require('../middlewares/rateLimiters');
const {validateId, validateSignUp, validateLogIn, validateResult} = require('../middlewares/validator');
const router = express.Router();

router.get('/login', isGuest, controller.login);

router.post('/login', logInLimiter, isGuest, validateLogIn, validateResult,  controller.authenticate);

router.get('/signup', isGuest, validateSignUp, controller.signup);

router.post('/signup', isGuest, validateSignUp, controller.create);

router.get('/profile',authenticated, controller.profile);

router.get('/logout',authenticated, controller.logout);

router.post('/trades/:id', authenticated, controller.trades);

router.get('/trade/offer/:id', authenticated, controller.offer);
router.get('/trade/ownoffer/:id', authenticated, controller.ownoffer);

router.put('/trade/offer/cancel/:id', authenticated, controller.cancelOffer);
router.put('/trade/offer/accept/:id', authenticated, controller.acceptOffer);

router.get('/msg', controller.msg);

router.get('/about',controller.about);

router.get('/contact',controller.contact);

module.exports = router;