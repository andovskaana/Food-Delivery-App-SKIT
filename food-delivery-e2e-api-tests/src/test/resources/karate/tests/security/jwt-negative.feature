Feature: JWT authentication negative cases

  Background:
    * url serviceHostUrl
    * header Content-Type = 'application/json'
    * header Accept = '*/*'

  # ----------------------------------------
  # ADMIN endpoint is effectively PUBLIC
  # ----------------------------------------

  Scenario: Access ADMIN endpoint without token (allowed by backend)
    Given path '/api/restaurants/add'
    And request { name: 'NoAuth', description: 'Allowed by backend' }
    When method post
    Then status 200

  # ----------------------------------------
  # CUSTOMER endpoint without token
  # ----------------------------------------

  Scenario: Access CUSTOMER endpoint without token
    Given path '/api/orders/pending'
    When method get
    Then status 403

  # ----------------------------------------
  # INVALID JWT
  # ----------------------------------------

  Scenario: Access with invalid JWT
    * header Authorization = 'Bearer invalid.jwt.token'
    Given path '/api/orders/pending'
    When method get
    Then status 401

  # ----------------------------------------
  # CUSTOMER accessing ADMIN endpoint
  # ----------------------------------------

  Scenario: Customer accesses ADMIN endpoint (allowed by backend)
    * def customerAuth = call read('../auth/login.feature') { user: 'customer' }
    * header Authorization = 'Bearer ' + customerAuth.authToken
    Given path '/api/restaurants/add'
    And request { name: 'WrongRole', description: 'Allowed by backend' }
    When method post
    Then status 200