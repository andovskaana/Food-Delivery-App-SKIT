Feature: Restaurants CRUD operations (id-safe)

  Background:
    * url serviceHostUrl
    # obtain token for admin (CRUD is admin-only)
    * def adminAuth = callonce read('../auth/login.feature') { user: 'admin' }
    * def adminToken = adminAuth.authToken
    * header Content-Type = 'application/json'
    * header Accept = '*/*'

  # Public: List all restaurants
  Scenario: List restaurants (public)
    Given path '/api/restaurants'
    When method get
    Then status 200

  # Public: Get by ID
  Scenario: Get restaurant by ID (public)
    Given path '/api/restaurants/1'
    When method get
    Then status 200

  # End-to-end: CREATE -> GET -> EDIT -> DELETE -> VERIFY DELETED
  Scenario: Admin creates restaurant, edits, deletes (id-safe)
    # ===== CREATE =====
    * header Authorization = 'Bearer ' + adminToken
    * def uniqueName = 'Test Restaurant ' + java.util.UUID.randomUUID()
    Given path '/api/restaurants/add'
    And request
    """
    {
      "name": #(uniqueName),
      "address": "123 Test St",
      "phone": "123-456-7890",
      "email": "test@restaurant.com",
      "openingHours": "9-5",
      "imageUrl": "https://example.com/image.jpg"
    }
    """
    When method post
    Then status 200
    And match response contains { name: #(uniqueName) }
    * def rid = response.id

    # ===== PUBLIC GET (by id) =====
    * header Authorization = null
    Given path '/api/restaurants', rid
    When method get
    Then status 200
    And match response.id == rid
    And match response.name == uniqueName

    # ===== EDIT =====
    * header Authorization = 'Bearer ' + adminToken
    Given path '/api/restaurants/edit', rid
    And request
    """
    {
      "name": "Edited Restaurant",
      "address": "456 Edit Ave",
      "phone": "987-654-3210",
      "email": "edited@restaurant.com",
      "openingHours": "10-6",
      "imageUrl": "https://example.com/edited.jpg"
    }
    """
    When method put
    Then status 200
    And match response contains { id: #(rid), name: 'Edited Restaurant' }

    # ===== DELETE =====
    * header Authorization = 'Bearer ' + adminToken
    Given path '/api/restaurants/delete', rid
    When method delete
    Then status 200

    # ===== VERIFY DELETED =====
    * header Authorization = null
    Given path '/api/restaurants', rid
    When method get
    Then status 404

#  # Negative: Create without auth
#  Scenario: Unauthorized create restaurant
#    Given path '/api/restaurants/add'
#    And request { "name": "Unauthorized" }
#    When method post
#    Then status 401  # Or 403

  # Negative: Get non-existent ID
  Scenario: Get non-existent restaurant
    Given path '/api/restaurants/999999'
    When method get
    Then status 404

  # Negative: Edit non-existent
  Scenario: Edit non-existent restaurant
    * header Authorization = 'Bearer ' + adminToken
    Given path '/api/restaurants/edit/999999'
    And request { "name": "Non-existent" }
    When method put
    Then status 404

  # Negative: Delete non-existent
  Scenario: Delete non-existent restaurant
    * header Authorization = 'Bearer ' + adminToken
    Given path '/api/restaurants/delete/999999'
    When method delete
    Then status 404