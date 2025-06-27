const SearchedWord = require("../models/SearchedWord");

exports.createSearchedWord = async (data) => {
  const searchedWord = new SearchedWord(data);
  return searchedWord.save();
};

exports.deleteSearchedWord = async (id) => {
  return SearchedWord.findByIdAndDelete(id);
};

exports.getAllSearchedWordsByUser = async (userId) => {
  return SearchedWord.find({ user: userId }).sort({ createdAt: -1 });
};

exports.getAllSearchedWords = async () => {
  return SearchedWord.find().sort({ createdAt: -1 });
};

exports.getOneSearchedWord = async (id) => {
  return SearchedWord.findById(id);
};
