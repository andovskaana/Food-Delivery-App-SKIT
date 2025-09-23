Feature: Orders operations (id-safe)

  Background:
    * url serviceHostUrl
    # obtain tokens for customer, admin, courier (orders involve multiple roles)
    * def adminAuth = callonce read('../auth/login.feature') { user: 'admin' }
    * def adminToken = adminAuth.authToken
    * def customerAuth = callonce read('../auth/login.feature') { user: 'customer' }
    * def customerToken = customerAuth.authToken
    * def courierAuth = callonce read('../auth/login.feature') { user: 'courier' }
    * def courierToken = courierAuth.authToken
    * header Content-Type = 'application/json'
    * header Accept = '*/*'

  # Likely admin/courier: List confirmed orders
  Scenario: List confirmed orders (auth required?)
    * header Authorization = 'Bearer ' + adminToken
    Given path '/api/orders/confirmed'
    When method get
    Then status 200

  # Customer: Get or create pending
  Scenario: Customer gets or creates pending order
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/pending'
    When method get
    Then status 200

  # End-to-end: CUSTOMER CREATES PENDING -> ADD PRODUCT -> UPDATE ADDRESS -> CONFIRM -> TRACK -> CANCEL
  Scenario: Customer manages order lifecycle (id-safe)
    # ===== GET/CREATE PENDING =====
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/pending'
    When method get
    Then status 200
    * def oid = response.id

    # ===== PICK A PRODUCT ID (any valid one) =====
    * header Authorization = null
    Given path '/api/products'
    When method get
    Then status 200
    * def pid = response.length > 0 ? response[0].id : 1

    # ===== ADD AT LEAST ONE ITEM (products endpoint) =====
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/products/add-to-order', pid
    # Swagger shows only the product path param; no body/params required
    When method post
    Then status 200
    # optional: sanity check that status is still PENDING
    And match response.status == 'PENDING'

    # ===== UPDATE ADDRESS (use correct schema) =====
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/address', oid
    And request
    """
    {
      "line1": "Test St",
      "city": "Test City",
      "postalCode": "12345"
    }
    """
    When method put
    Then status 200
    And match response.deliveryAddress contains { line1: 'Test St', city: 'Test City', postalCode: '12345' }

    # ===== CONFIRM (now that there is at least one item) =====
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/pending/confirm'
    And request {}   # harmless body for stricter PUT handlers
    When method put
    Then status 200
    * def confirmedOid = response.id

    # ===== TRACK =====
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/track', confirmedOid
    When method get
    Then status 200

    # ===== MY ORDERS =====
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/my-orders'
    When method get
    Then status 200
    And match response[*].id contains confirmedOid

   # ===== CART (after confirm) =====
# After confirm there's no pending cart; create/fetch a new pending first
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/pending'
    When method get
    Then status 200
    * def newPendingId = response.id

# Add a product to the NEW pending so /cart becomes available
# (pick any valid product; fall back to 1 if list is empty)
    * header Authorization = null
    Given path '/api/products'
    When method get
    Then status 200
    * def newPid = response.length > 0 ? response[0].id : 1

    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/products/add-to-order', newPid
    When method post
    Then status 200
# Check: still pending
    And match response.status == 'PENDING'
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/cart'
    When method get
    Then status 200


    # ===== CANCEL (if API allows cancel when there is a pending order) =====
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/pending/cancel'
    When method put
    Then status 200

  # Negative: Track non-owned order
  Scenario: Customer tracks non-owned order
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/track/999999'
    When method get
    Then status 404

  # Negative: Update address for non-existent order
  Scenario: Update address for non-existent order
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/address/999999'
    And request { "line1": "Invalid" }
    When method put
    Then status 403

  # Edge: Get order by ID
  Scenario: Get order by ID
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/1'
    When method get
    Then status 200

  # Negative: Get non-existent order
  Scenario: Get non-existent order
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/999999'
    When method get
    Then status 404
