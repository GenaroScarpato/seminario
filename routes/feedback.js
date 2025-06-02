const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback');

router.get('/', feedbackController.getFeedbacks);
router.post('/', feedbackController.createFeedback);
router.put('/:id', feedbackController.updateFeedback);
router.delete('/:id', feedbackController.deleteFeedback);

module.exports = router;
