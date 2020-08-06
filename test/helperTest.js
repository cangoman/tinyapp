const { expect, assert } = require('chai');

const { getUserByEmail, generateRandomString, formatHTTP, urlsForUser} = require('../helpers');

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

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": {longURL: "http://www.google.com", userID: "user2RandomID" }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.deepEqual(user, testUsers[expectedOutput]);
  });

  it('should return undefined for an invalid email', function() {
    const user = getUserByEmail("user@example.edu", testUsers);
    assert.isUndefined(user);
  });

});

describe('generateRandomString', function() {
  it('should return a random string of six characters', function() {
    const randomString = generateRandomString();
    expect(randomString).to.have.lengthOf(6);
    expect(randomString).to.be.a('string');

  });
});

describe('formatHTTP', function() {
  it('should return a valid and complete http address', function() {
    const url = 'www.google.com';
    const expectedOutput = 'http://www.google.com';
    assert.strictEqual(formatHTTP(url), expectedOutput);
  });

  it('should return a valid and complete http address', function() {
    const url = 'http://www.google.com';
    const expectedOutput = 'http://www.google.com';
    assert.strictEqual(formatHTTP(url), expectedOutput);
  });
});

describe('urlsForUser', function() {
  it('should return an object with URLs belonging to a specific user', function() {
    const userId = 'userRandomID';
    const userURLs = urlsForUser(userId, urlDatabase);
    const expectedOutput = { "b2xVn2" : {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"}};
    assert.deepEqual(userURLs, expectedOutput);
  });

  it('should return an empty object if user has no URLs', function() {
    const userId = 'user3RandomID';
    const expectedOutput = {};
    assert.deepEqual(urlsForUser(userId, urlDatabase), expectedOutput);
  });
});