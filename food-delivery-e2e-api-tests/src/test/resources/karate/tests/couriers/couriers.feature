Feature: Couriers CRUD and operations (id-safe)

  Background:
    * url serviceHostUrl
    # tokens from your existing fixtures
    # obtain fresh tokens for each scenario instead of caching them.  This
    # avoids stale or invalid tokens when tests run in parallel or when user
    # credentials change during other scenarios.  Each call to the login
    # feature returns a new JWT for the specified user.
    * def adminAuth = call read('../auth/login.feature') { user: 'admin' }
    * def adminToken = adminAuth.authToken
    * def courierAuth = call read('../auth/login.feature') { user: 'courier' }
    * def courierToken = courierAuth.authToken
    * def customerAuth = call read('../auth/login.feature') { user: 'customer' }
    * def customerToken = customerAuth.authToken
    * header Content-Type = 'application/json'
    * header Accept = '*/*'

  Scenario: List couriers (public?)
    * header Authorization = 'Bearer ' + adminToken
    Given path '/api/couriers'
    When method get
    Then status 200
    # keep one id for reference
    * def anyCourierId = response.length > 0 ? response[0].id : null

  Scenario: Admin cannot assigns/completes order (id-safe)
    # ===== PICK EXISTING COURIER =====
    * header Authorization = 'Bearer ' + adminToken
    Given path '/api/couriers'
    When method get
    Then status 200
    * if (response.length == 0) karate.fail('No couriers exist in the system. Seed at least one courier entity.')
    * def cid = response[0].id

    # ===== GET BY ID (matches Swagger: {id,name,active}) =====
    * header Authorization = 'Bearer ' + adminToken
    Given path '/api/couriers', cid
    When method get
    Then status 200
    And match response contains { id: '#(cid)', name: '#string', active: '#boolean' }

    # ===== PREP A CONFIRMED ORDER (customer flow) =====
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/pending'
    When method get
    Then status 200
    * def pendingId = response.id

    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/products/add-to-order/', pendingId
    When method post
    Then status 200

    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/address', pendingId
    And request { "line1": "Courier St", "city": "Skopje", "postalCode": "1000" }
    When method put
    Then status 200

    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/pending/confirm'
    And request {}
    When method put
    Then status 200
    * def orderId = response.id

    # ===== COURIER ASSIGNS & COMPLETES (existing courier account) =====
    * header Authorization = 'Bearer ' + courierToken
    Given path '/api/couriers/assign', orderId
    When method post
    Then status 200

    * header Authorization = 'Bearer ' + courierToken
    Given path '/api/couriers/complete', orderId
    When method post
    Then status 200

    * header Authorization = 'Bearer ' + courierToken
    Given path '/api/couriers/my-delivered-orders'
    When method get
    Then status 200
    And match response[*].id contains orderId

  Scenario: Courier assigns non-existent order
    * header Authorization = 'Bearer ' + courierToken
    Given path '/api/couriers/assign/999999'
    When method post
    Then status 403

  Scenario: Unauthorized list couriers
    * header Authorization = null
    Given path '/api/couriers'
    When method get
    Then status 403

  # Negative: Courier cannot be assigned to two orders at the same time
  #
  # The assignToOrder endpoint should mark a courier as busy (active=false) when
  # they are assigned to a confirmed order.  If the same courier attempts to
  # assign themselves to another confirmed order while still busy the service
  # should reject the second assignment.  This scenario covers the branch in
  # CourierServiceImpl.assignToOrder() that checks the courier's active flag.
  Scenario: Courier assignment fails when already busy
    # ----- prepare and confirm first order -----
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/pending'
    When method get
    Then status 200
    * def firstPendingId = response.id
    * header Authorization = null
    Given path '/api/products'
    When method get
    Then status 200
    * def firstPid = response.length > 0 ? response[0].id : 1
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/products/add-to-order', firstPid
    When method post
    Then status 200
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/address', firstPendingId
    And request { "line1": "Busy St", "city": "City", "postalCode": "1000" }
    When method put
    Then status 200
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/pending/confirm'
    And request {}
    When method put
    Then status 200
    * def firstOrderId = response.id
    # assign the courier to the first order
    * header Authorization = 'Bearer ' + courierToken
    Given path '/api/couriers/assign', firstOrderId
    When method post
    Then status 200
    # ----- prepare and confirm second order -----
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/pending'
    When method get
    Then status 200
    * def secondPendingId = response.id
    * header Authorization = null
    Given path '/api/products'
    When method get
    Then status 200
    * def secondPid = response.length > 0 ? response[0].id : 1
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/products/add-to-order', secondPid
    When method post
    Then status 200
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/address', secondPendingId
    And request { "line1": "Busy St", "city": "City", "postalCode": "1000" }
    When method put
    Then status 200
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/pending/confirm'
    And request {}
    When method put
    Then status 200
    * def secondOrderId = response.id
    # attempt to assign the busy courier to the second order - should fail
    * header Authorization = 'Bearer ' + courierToken
    Given path '/api/couriers/assign', secondOrderId
    When method post
    Then status 403

  # Negative: Courier cannot assign an order that is not confirmed
  #
  # If an order has status PENDING the courier should not be allowed to
  # pick it up.  This scenario exercises the branch that checks the order
  # status in CourierServiceImpl.assignToOrder().
  Scenario: Courier cannot assign pending order
    # create a pending order but do not confirm it
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/pending'
    When method get
    Then status 200
    * def pendingOid = response.id
    * header Authorization = null
    Given path '/api/products'
    When method get
    Then status 200
    * def prodId = response.length > 0 ? response[0].id : 1
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/products/add-to-order', prodId
    When method post
    Then status 200
    # do not confirm, just attempt to assign as courier
    * header Authorization = 'Bearer ' + courierToken
    Given path '/api/couriers/assign', pendingOid
    When method post
    Then status 403

  # Negative: Courier cannot complete delivery of an order that has not been assigned to them
  #
  # To complete a delivery the order must be in status PICKED_UP and assigned
  # to the courier.  This scenario covers the branch in
  # CourierServiceImpl.completeDelivery() that rejects a courier when they
  # attempt to complete a delivery for an order that is not theirs.
  Scenario: Courier cannot complete unassigned order
    # prepare a confirmed order but do not assign it
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/pending'
    When method get
    Then status 200
    * def tmpOid = response.id
    * header Authorization = null
    Given path '/api/products'
    When method get
    Then status 200
    * def tmpProductId = response.length > 0 ? response[0].id : 1
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/products/add-to-order', tmpProductId
    When method post
    Then status 200
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/address', tmpOid
    And request { "line1": "Unassigned St", "city": "City", "postalCode": "1000" }
    When method put
    Then status 200
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/pending/confirm'
    And request {}
    When method put
    Then status 200
    * def confirmedUnassigned = response.id
    # attempt to complete delivery without assigning
    * header Authorization = 'Bearer ' + courierToken
    Given path '/api/couriers/complete', confirmedUnassigned
    When method post
    Then status 403
