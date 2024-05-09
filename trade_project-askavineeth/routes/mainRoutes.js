const express = require('express');
const controller = require('../controllers/mainController');
const model  = require('../models/items');
const {authenticated, isAuthor} = require('../middlewares/auth');
const {validateId, validateTrade, validateResult} = require('../middlewares/validator'); 
const router = express.Router();

router.get('/',controller.index);

router.get('/new', authenticated, controller.new);

router.post('/', authenticated, /*validateTrade ,*/ validateResult, controller.create);

router.get('/:id',validateId, controller.show);

router.get('/:id/edit',validateId, authenticated, isAuthor, controller.edit);

router.put('/:id', validateId, authenticated, isAuthor, controller.update);
console.log("update")

router.delete('/:id',validateId,authenticated, isAuthor, controller.delete);

//POST /connections/:id/rsvp: user response to rsvp
router.post('/:id/watch', validateId, authenticated, controller.watchList);

//DELETE /connections/rsvp/:id: delete the rsvp identified by id
router.delete('/watch/:id', validateId, authenticated, controller.deletewatchList);

router.put('/trade/:id', validateId, controller.updateStatus);
module.exports = router; 