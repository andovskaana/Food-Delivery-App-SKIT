Feature: Orders operations for customers

  Background:
    * url serviceHostUrl
    * def customerAuth = callonce read('../auth/login.feature') { user: 'customer' }
    * def customerToken = customerAuth.authToken
    * header Authorization = 'Bearer ' + customerToken
    * header Content-Type = 'application/json'
    * header Accept = '*/*'

  # Positive: retrieve current cart
  Scenario: Get customer cart
    Given path '/api/orders/cart'
    When method get
    Then status 200

  # Positive: update address for order
  Scenario: Update address for order
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/products/add-to-order', 3
    When method post
    Then status 200
    Given path '/api/orders/address/3'
    And request
    """
    {
      "street": "Partizanska 12",
      "city": "Skopje",
      "zip": "1000",
      "country": "MK"
    }
    """
    When method put
    Then status 200
    And match response.id == 3

  # Negative: update address for non-existent order id
  Scenario: Update address for non-existent order
    Given path '/api/orders/address/9999'
    And request { street: 'Nowhere', city: 'N/A', zip: '0000', country: 'MK' }
    When method put
    Then status 403
