const userModel = require('../models/users');

exports.getUsers = async (req, res) => {
  try {
    const users = await userModel.getAll(req.pool);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const newUser = await userModel.create(req.pool, { name, email, password, role });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, password, role } = req.body;
    const updatedUser = await userModel.update(req.pool, id, { name, email, password, role });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    await userModel.delete(req.pool, id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
