Feature: User registration and login

  Background:
    * url serviceHostUrl
    * header Content-Type = 'application/json'
    * header Accept = '*/*'

  # Positive: register a new user with unique username
  Scenario: Register new user
    * def now = java.lang.System.currentTimeMillis()
    * def uname = 'user_' + now
    Given path '/api/user/register'
    And request { username: '#(uname)', password: 'Passw0rd!', email: '#(uname)@mail.test' }
    When method post
    Then status 200
    And match response contains { username: '#(uname)' }

  # Positive: login with valid admin credentials
  Scenario: Login as admin
    Given path '/api/user/login'
    And request { username: 'admin', password: 'admin' }
    When method post
    Then status 200
    And match response == { token: '#string' }

  # Negative: register user with existing username returns conflict
  Scenario: Register duplicate user should fail
    * def uname2 = 'admin'
    Given path '/api/user/register'
    And request { username: '#(uname2)', password: 'OtherPass1!', email: 'duplicate@mail.test' }
    When method post
    Then status 403

  # Negative: login with wrong password returns unauthorized
  Scenario: Login with wrong password
    Given path '/api/user/login'
    And request { username: 'admin', password: 'wrongpass' }
    When method post
    Then status 403
