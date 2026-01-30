Feature: Payments operations (basic)

  Background:
    * url serviceHostUrl
    # login as customer
    * def customerAuth = call read('../auth/login.feature') { user: 'customer' }
    * def customerToken = customerAuth.authToken
    * header Content-Type = 'application/json'
    * header Accept = '*/*'

  Scenario: Create payment intent and verify lifecycle
    # ===== GET OR CREATE PENDING ORDER =====
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/pending'
    When method get
    Then status 200
    * def orderId = response.id

    # ===== ADD A PRODUCT =====
    * header Authorization = null
    Given path '/api/products'
    When method get
    Then status 200
    * def pid = response.length > 0 ? response[0].id : 1

    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/products/add-to-order', pid
    When method post
    Then status 200

    # ===== CONFIRM ORDER =====
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/pending/confirm'
    And request {}
    When method put
    Then status 200
    * def confirmedOid = response.id

    # ===== CREATE PAYMENT INTENT =====
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/payments', confirmedOid, 'intent'
    When method post
    Then status 200
    * def paymentId = response.id
    And match paymentId != null

    # ===== GET THE PAYMENT =====
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/payments', paymentId
    When method get
    Then status 200
    And match response.id == paymentId

    # ===== SIMULATE SUCCESS =====
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/payments', paymentId, 'simulate-success'
    When method post
    Then status 200

    # Poll until final success state
    * configure retry = { count: 5, interval3: 1000 }
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/payments', paymentId
    And retry until response.status == 'CAPTURED' || response.status == 'AUTHORIZED'
    When method get
    Then status 200
    And match ['CAPTURED','AUTHORIZED'] contains response.status

    # ===== SIMULATE FAILURE =====
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/payments', confirmedOid, 'intent'
    When method post
    Then status 200
    * def failPaymentId = response.id

    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/payments', failPaymentId, 'simulate-failure'
    When method post
    Then status 200
    And match response.status == 'FAILED'

  Scenario: Simulate failed payment requiring authentication
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/pending'
    When method get
    Then status 200
    * def oid = response.id

    * header Authorization = null
    Given path '/api/products'
    When method get
    Then status 200
    * def pid = response.length > 0 ? response[0].id : 1

    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/products/add-to-order', pid
    When method post
    Then status 200

    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/pending/confirm'
    And request {}
    When method put
    Then status 200
    * def confirmedOid = response.id

    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/payments', confirmedOid, 'intent'
    When method post
    Then status 200
    * def paymentId = response.id

    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/payments', paymentId, 'simulate-failure'
    When method post
    Then status 200
    And match response.status == 'FAILED'

  # Negative: Try to create payment intent for non-existent order
  Scenario: Payment intent fails for missing order
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/payments/999999/intent'
    When method post
    Then status 403

  Scenario: Get non-existent payment
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/payments/999999'
    When method get
    Then status 403

  Scenario: Simulate success on non-existent
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/payments/999999/simulate-success'
    When method post
    Then status 403

  Scenario: Simulate failure on non-existent
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/payments/999999/simulate-failure'
    When method post
    Then status 403