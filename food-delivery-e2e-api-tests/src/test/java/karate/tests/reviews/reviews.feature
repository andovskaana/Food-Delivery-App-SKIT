Feature: Reviews CRUD and operations (id-safe)

  Background:
    * url serviceHostUrl
    # obtain tokens for admin and customer roles (reviews are likely customer-added, admin might manage)
    * def adminAuth = callonce read('../auth/login.feature') { user: 'admin' }
    * def adminToken = adminAuth.authToken
    * def customerAuth = callonce read('../auth/login.feature') { user: 'customer' }
    * def customerToken = customerAuth.authToken
    * header Content-Type = 'application/json'
    * header Accept = '*/*'

  # Public: List reviews for a restaurant
  Scenario: List reviews for restaurant (public)
    Given path '/api/reviews/1'
    When method get
    Then status 200

  # End-to-end: CUSTOMER ADDS REVIEW -> GET LIST -> (No edit/delete in controller, so verify only)
  Scenario: Customer adds review to restaurant, verify in list (id-safe)
    # Prerequisite: Assume restaurant ID 1 exists; for full coverage, could create but not in this controller
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/reviews/1'
    And param rating = 5
    And param comment = 'Great food!'
    When method post
    Then status 200
    And match response contains { rating: 5, comment: 'Great food!' }
    * def review = response

    # PUBLIC GET LIST (verify added)
    * header Authorization = null
    Given path '/api/reviews/1'
    When method get
    Then status 200
    And match response[*] contains { rating: 5, comment: 'Great food!' }

  # Negative: Add review with invalid rating (e.g., out of bounds)
  Scenario: Customer adds review with invalid rating
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/reviews/1'
    And param rating = 6
    And param comment = 'Invalid'
    When method post
    Then status 400

  # Negative: Add review without auth
  Scenario: Unauthorized add review
    Given path '/api/reviews/1'
    And param rating = 4
    When method post
    Then status 403

  # Edge: Add review with no comment (optional param)
  Scenario: Customer adds review without comment
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/reviews/1'
    And param rating = 3
    When method post
    Then status 200
    And match response contains { rating: 3, comment: '#null' }

  # Negative: List for non-existent restaurant
  Scenario: List reviews for non-existent restaurant
    Given path '/api/reviews/999999'
    When method get
    Then status 403