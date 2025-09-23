Feature: Payments operations (id-safe)

  Background:
    * url serviceHostUrl
    * def customerAuth = callonce read('../auth/login.feature') { user: 'customer' }
    * def customerToken = customerAuth.authToken
    * header Content-Type = 'application/json'
    * header Accept = '*/*'

  # Helper: create a confirmed order for this customer and return its id
  Scenario: _helper create confirmed order
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/pending'
    When method get
    Then status 200
    * def __oid = response.id

    * header Authorization = null
    Given path '/api/products'
    When method get
    Then status 200
    * def __pid = response.length > 0 ? response[0].id : 1

    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/products/add-to-order', __pid
    When method post
    Then status 200

    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/address', __oid
    And request { "line1": "Pay St", "city": "Skopje", "postalCode": "1000" }
    When method put
    Then status 200

    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/pending/confirm'
    And request {}
    When method put
    Then status 200
    * def result = { orderId: response.id }

  # CREATE INTENT -> GET -> SUCCESS -> FAILURE
  Scenario: Manage payment for order (id-safe)
    * def created = call read('payments.feature@_helper create confirmed order')
    * def orderId = created.result.orderId

    # ===== CREATE INTENT =====
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/payments', orderId, 'intent'
    When method post
    Then status 200
    * def pid = response.id

    # ===== GET =====
    Given path '/api/payments', pid
    When method get
    Then status 200
    And match response.id == pid

    # ===== SIMULATE SUCCESS =====
    Given path '/api/payments', pid, 'simulate-success'
    When method post
    Then status 200
    # success must be CAPTURED or AUTHORIZED (your enum)
    * match ['CAPTURED', 'AUTHORIZED'] contains response.status

    # ===== SIMULATE FAILURE (new intent) =====
    * def created2 = call read('payments.feature@_helper create confirmed order')
    * def orderId2 = created2.result.orderId

    Given path '/api/payments', orderId2, 'intent'
    When method post
    Then status 200
    * def failPid = response.id

    Given path '/api/payments', failPid, 'simulate-failure'
    When method post
    Then status 200
    And match response.status == 'FAILED'

  # Another success path (same allowed statuses)
  Scenario: Simulate successful payment with alternative success path
    * def created = call read('payments.feature@_helper create confirmed order')
    * def orderId = created.result.orderId

    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/payments', orderId, 'intent'
    When method post
    Then status 200
    * def pid = response.id

    Given path '/api/payments', pid, 'simulate-success'
    When method post
    Then status 200
    * match ['CAPTURED', 'AUTHORIZED'] contains response.status

  # Simulate failure that requires additional authentication (3DS, etc.)
  Scenario: Simulate failed payment with authentication required
    * def created = call read('payments.feature@_helper create confirmed order')
    * def orderId = created.result.orderId

    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/payments', orderId, 'intent'
    When method post
    Then status 200
    * def pid = response.id

    Given path '/api/payments', pid, 'simulate-failure'
    When method post
    Then status 200
    And match response.status == 'REQUIRES_ACTION'

  # Negative: Intent for non-existent order
  Scenario: Create intent for non-existent order
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/payments/999999/intent'
    When method post
    Then status 404

  # Negative: Get non-existent payment
  Scenario: Get non-existent payment
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/payments/999999'
    When method get
    Then status 403

  # Negative: Simulate success on invalid
  Scenario: Simulate success on non-existent
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/payments/999999/simulate-success'
    When method post
    Then status 403

  # Negative: Simulate failure on invalid
  Scenario: Simulate failure on non-existent
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/payments/999999/simulate-failure'
    When method post
    Then status 403
