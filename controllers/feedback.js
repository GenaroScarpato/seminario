const feedbackModel = require('../models/feedback');

exports.getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await feedbackModel.getAll(req.pool);
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createFeedback = async (req, res) => {
  try {
    const feedbackData = req.body;
    const nuevoFeedback = await feedbackModel.create(req.pool, feedbackData);
    res.status(201).json(nuevoFeedback);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateFeedback = async (req, res) => {
  try {
    const id = req.params.id;
    const feedbackData = req.body;
    const feedbackActualizado = await feedbackModel.update(req.pool, id, feedbackData);
    res.json(feedbackActualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    const id = req.params.id;
    await feedbackModel.delete(req.pool, id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
