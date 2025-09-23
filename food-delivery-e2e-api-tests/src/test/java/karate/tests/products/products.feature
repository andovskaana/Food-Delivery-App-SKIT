Feature: Products CRUD and cart operations (id-safe)

  Background:
    * url serviceHostUrl
    # obtain tokens for admin and customer roles
    * def adminAuth = callonce read('../auth/login.feature') { user: 'admin' }
    * def adminToken = adminAuth.authToken
    * def customerAuth = callonce read('../auth/login.feature') { user: 'customer' }
    * def customerToken = customerAuth.authToken
    * header Content-Type = 'application/json'
    * header Accept = '*/*'

  # Optional: public list works
  Scenario: List products (public)
    Given path '/api/products'
    When method get
    Then status 200

  # Public: Get by ID with details
  Scenario: Get product details (public)
    Given path '/api/products/details/1'
    When method get
    Then status 200

  # End-to-end: CREATE -> GET -> EDIT -> ADD/REMOVE TO ORDER -> DELETE -> VERIFY DELETED
  Scenario: Admin creates product, edits, customer adds/removes to order, admin deletes (id-safe)
    # ===== CREATE =====
    * header Authorization = 'Bearer ' + adminToken
    * def uniqueName = 'Nachos ' + java.util.UUID.randomUUID()
    Given path '/api/products/add'
    And request
    """
    {
      "name": #(uniqueName),
      "description": "Крцкави начоси со сос",
      "price": 450,
      "quantity": 100,
      "restaurantId": 1,
      "isAvailable": true,
      "category": "Стартери 🧀",
      "imageUrl": "https://example.com/nachos.jpg"
    }
    """
    When method post
    Then status 200
    And match response contains { name: #(uniqueName) }
    * def pid = response.id

    # ===== PUBLIC GET (by id) =====
    * header Authorization = null
    Given path '/api/products', pid
    When method get
    Then status 200
    And match response.id == pid
    And match response.name == uniqueName

    # ===== EDIT =====
    * header Authorization = 'Bearer ' + adminToken
    Given path '/api/products/edit', pid
    And request
    """
    {
      "id": #(pid),
      "name": "Nachos Edited",
      "description": "Мексикански чипс прелиен со топен кашкавал и пикантен начос кашкавал, сервиран со салса и крем сос",
      "price": 450,
      "quantity": 100,
      "restaurantId": 1,
      "isAvailable": true,
      "category": "Стартери 🧀",
      "imageUrl": "https://www.korpa.ba/product_uploads/BsQOsbCBZe6eKxKzvvXBz0b0aGd0uTJT.jpg"
    }
    """
    When method put
    Then status 200
    And match response contains { id: #(pid), name: 'Nachos Edited' }

    # ===== CUSTOMER: ADD TO ORDER =====
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/products/add-to-order', pid
    When method post
    Then status 200
    And match response.id == '#number'

    # ===== CUSTOMER: REMOVE FROM ORDER =====
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/products/remove-from-order', pid
    When method post
    Then status 200
    And match response.id == '#number'

    # ===== DELETE =====
    * header Authorization = 'Bearer ' + adminToken
    Given path '/api/products/delete', pid
    When method delete
    Then status 200

    # ===== VERIFY DELETED =====
    * header Authorization = null
    Given path '/api/products', pid
    When method get
    Then status 404

  # Negative: add-to-order non-existent product -> expect 404/400/403 (прилагоди)
  Scenario: Customer adds non-existent product to order
    * header Authorization = 'Bearer ' + customerToken
    * def fakeId = 999999999
    Given path '/api/products/add-to-order', fakeId
    When method post
    Then status 403  # Adjust based on impl

  # Negative: Get details non-existent
  Scenario: Get details for non-existent product
    Given path '/api/products/details/999999'
    When method get
    Then status 404