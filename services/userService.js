const userRepository = require('../repositories/userRepository');

module.exports.getUser = async (userId) => {
  const data = await userRepository.getUser(userId);
  if (!data.Item) {
    throw new Error(`User ${userId} was not found!`)
  }
  return data.Item;
}

module.exports.getUsers = async (query) => {
  const filterExpression = Object.keys(query).map(key => (`${key} = :target_${key}`)).join(' and ');
  const expressionAttributeValues = {};
  Object.keys(query).forEach(key => {
    expressionAttributeValues[`:target_${key}`] = query[key];
  });

  const data = await userRepository.scan(filterExpression, expressionAttributeValues);
  return data.Items;
}