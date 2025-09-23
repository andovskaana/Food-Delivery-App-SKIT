Feature: Couriers CRUD and operations (id-safe)

  Background:
    * url serviceHostUrl
    # tokens from your existing fixtures
    * def adminAuth = callonce read('../auth/login.feature') { user: 'admin' }
    * def adminToken = adminAuth.authToken
    * def courierAuth = callonce read('../auth/login.feature') { user: 'courier' }
    * def courierToken = courierAuth.authToken
    * def customerAuth = callonce read('../auth/login.feature') { user: 'customer' }
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

  Scenario: Admin manages courier, courier assigns/completes order (id-safe)
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
    And match response contains { id: #(cid), name: '#string', active: '#boolean' }
#
#    # ===== EDIT  =====
#    * header Authorization = 'Bearer ' + adminToken
#    Given path '/api/couriers/edit', cid
#    And request
#    """
#    {
#      "name": "NewEditedName",
#      "phone": "001",
#      "active": true
#    }
#    """
#    When method put
#    Then status 200
#    And match response contains { id: #(cid), name: 'Edited Courier', active: true }

    # ===== PREP A CONFIRMED ORDER (customer flow) =====
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/orders/pending'
    When method get
    Then status 200
    * def pendingId = response.id

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
