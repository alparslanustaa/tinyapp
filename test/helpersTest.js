const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    const expectedUserEmail = "user@example.com";
    const expectedPassword = "purple-monkey-dinosaur";
    const expectedUserObj = {
      id:expectedUserID,
      email:expectedUserEmail,
      password:expectedPassword
    }
    // Write your assert statement here
    assert.deepEqual(user, expectedUserObj);

  });
  it('should return undefined with non-existent email!', function() {
    const user = getUserByEmail("user1@example.com", testUsers)
    const expectedUserObj = undefined;
    // Write your assert statement here
    assert.deepEqual(user, expectedUserObj);

  });
  
});

