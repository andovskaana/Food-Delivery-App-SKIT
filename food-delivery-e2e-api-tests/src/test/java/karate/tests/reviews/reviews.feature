Feature: Reviews CRUD and operations (id-safe)

  Background:
    * url serviceHostUrl
    # obtain tokens for admin and customer roles
    * def adminAuth = callonce read('../auth/login.feature') { user: 'admin' }
    * def adminToken = adminAuth.authToken
    * def customerAuth = callonce read('../auth/login.feature') { user: 'customer' }
    * def customerToken = customerAuth.authToken
    * header Content-Type = 'application/json'
    * header Accept = '*/*'

  # End-to-end: CUSTOMER ADDS REVIEW -> GET LIST -> verify present
  Scenario: Customer adds review to restaurant, verify in list (id-safe)
    * def restaurantId = 1
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/reviews', restaurantId
    And param rating = 5
    And param comment = 'Great food!'
    When method post
    Then status 200
    And match response contains { rating: 5, comment: 'Great food!' }
    * def review = response

    # PUBLIC GET LIST (verify added)
    * header Authorization = null
    Given path '/api/reviews', restaurantId
    When method get
    Then status 200
    And match response[*].comment contains 'Great food!'


  # Negative: Add review without auth
  Scenario: Unauthorized add review
    * def restaurantId = 1
    Given path '/api/reviews', restaurantId
    And param rating = 4
    When method post
    Then status 403

  # Edge: Add review with no comment (optional param)
  Scenario: Customer adds review without comment
    * def restaurantId = 1
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/reviews', restaurantId
    And param rating = 3
    When method post
    Then status 200
    And match response contains { rating: 3, comment: '#null' }

  # Negative: List for non-existent restaurant
  Scenario: List reviews for non-existent restaurant
    Given path '/api/reviews/999999'
    When method get
    Then status 403
