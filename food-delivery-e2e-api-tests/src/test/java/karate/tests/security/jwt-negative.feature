Feature: JWT authentication negative cases

  Background:
    * url serviceHostUrl
    * header Content-Type = 'application/json'
    * header Accept = '*/*'

  # Missing Authorization header should result in 401
  Scenario: Access protected endpoint without token
    Given path '/api/restaurants/add'
    And request { name: 'NoAuth', description: 'Should fail' }
    When method post
    Then status 401

  # Invalid token should result in 401
  Scenario: Access with invalid JWT
    * header Authorization = 'Bearer invalid.jwt.token'
    Given path '/api/restaurants'
    When method get
    Then status 401
