Feature: Courier operations on assigned orders

  Background:
    * url serviceHostUrl
    * def courierAuth = callonce read('../auth/login.feature') { user: 'courier' }
    * def courierToken = courierAuth.authToken
    * header Authorization = 'Bearer ' + courierToken
    * header Content-Type = 'application/json'
    * header Accept = '*/*'

  # Positive: get my assigned orders
  Scenario: Courier retrieves assigned orders
    Given path '/api/couriers/my-orders'
    When method get
    Then status 200

  # Positive: get my delivered orders history
  Scenario: Courier retrieves delivered orders
    Given path '/api/couriers/my-delivered-orders'
    When method get
    Then status 200

