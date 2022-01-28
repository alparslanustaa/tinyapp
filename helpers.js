//email lookup helper function
function getUserByEmail(email, database) {
  for (let key in database) {
    if (database[key].email === email) {
      return database[key];
    }
  }
  return undefined;
}


module.exports = {getUserByEmail};