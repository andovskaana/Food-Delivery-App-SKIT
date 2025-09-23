Feature: Payment operations

  Background:
    * url serviceHostUrl
    # obtain admin token once per run to simulate payments
    * def adminAuth = callonce read('../auth/login.feature') { user: 'admin' }
    * def adminToken = adminAuth.authToken
    * header Authorization = 'Bearer ' + adminToken
    * header Content-Type = 'application/json'
    * header Accept = '*/*'

  # Positive: get payment by id 1
  Scenario: Get payment by id 1
    Given path '/api/payments/1'
    When method get
    Then status 200
    And match response.id == 1

  # Positive: simulate success for payment id 1
  Scenario: Simulate success on payment id=1
    Given path '/api/payments/1/simulate-success'
    When method post
    Then status 200
    And match response.id == 1
    And match response.status == 'CAPTURED'

  # Positive: simulate failure for payment id 2
  Scenario: Simulate failure on payment id=2
    Given path '/api/payments/2/simulate-failure'
    When method post
    Then status 200
    And match response.id == 2
    And match response.status == 'FAILED'

  # Negative: simulate success on non-existent payment returns 404
  Scenario: Simulate success on non-existent payment
    Given path '/api/payments/9999/simulate-success'
    When method post
    Then status 403
