const userRepository = require('../repositories/userRepository');

module.exports.getUser = async (userId) => {
  const data = await userRepository.getUser(userId);
  if (!data.Item) {
    throw new Error(`User ${userId} was not found!`)
  }
  return data.Item;
}
