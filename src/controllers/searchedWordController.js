const searchedWordService = require("../services/searchedWordService");

exports.create = async (req, res) => {
  try {
    const data = {
      user: req.user._id, // assumes user is authenticated
      word: req.body.word,
    };
    const result = await searchedWordService.createSearchedWord(data);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await searchedWordService.deleteSearchedWord(req.params.id);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Searched word not found" });
    }
    res.json({ success: true, message: "Searched word deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAllByUser = async (req, res) => {
  try {
    const result = await searchedWordService.getAllSearchedWordsByUser(
      req.user._id
    );
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const result = await searchedWordService.getAllSearchedWords();
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const result = await searchedWordService.getOneSearchedWord(req.params.id);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Searched word not found" });
    }
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
