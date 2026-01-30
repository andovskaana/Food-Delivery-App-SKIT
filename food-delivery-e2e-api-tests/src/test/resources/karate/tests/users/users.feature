Feature: Users CRUD and auth operations (id-safe)

  Background:
    * url serviceHostUrl
    # obtain token for admin (CRUD admin), customer for me/my
    # login fresh for admin and customer roles.  Caching tokens via callonce
    # can lead to authorization errors when tests run in parallel or user
    # credentials are updated.  Use call to obtain new JWTs for each scenario.
    * def adminAuth = call read('../auth/login.feature') { user: 'admin' }
    * def adminToken = adminAuth.authToken
    * def customerAuth = call read('../auth/login.feature') { user: 'customer' }
    * def customerToken = customerAuth.authToken
    * header Content-Type = 'application/json'
    * header Accept = '*/*'

  # Public?: Register new user (ALWAYS send full required body + unique email)
  Scenario: Register new user
    * def uniqueUsernameUser = 'testuser_' + java.util.UUID.randomUUID().toString().substring(0,8)
    * def uniqueEmailUser = uniqueUsernameUser + '@example.com'
    Given path '/api/user/register'
    And request
      """
      {
    "username": "#(uniqueUsernameUser)",
    "password": "initial",
    "name": "Customer2",
    "surname": "Adminovski",
    "email": "#(uniqueEmailUser)",
    "phone": "0000",
    "role": "ROLE_CUSTOMER"
    }
    """
    When method post
    Then status 200

  # Auth: Login (already in login.feature, but test invalid)
  Scenario: Invalid login
    Given path '/api/user/login'
    And request { "username": "invalid", "password": "wrong" }
    When method post
    Then status 403

  # Auth: Me
  Scenario: Get me (auth)
    * header Authorization = 'Bearer ' + customerToken
    Given path '/api/user/me'
    When method get
    Then status 200

  # End-to-end: ADMIN CREATES -> GET -> EDIT -> LIST -> DELETE -> VERIFY DELETED
  Scenario: Admin manages user (id-safe)
    # ===== CREATE (register with full schema, unique email) =====
    * header Authorization = 'Bearer ' + adminToken
    * def uniqueUsername = 'testadminuser_' + java.util.UUID.randomUUID().toString().substring(0,8)
    * def uniqueEmailAdmin = uniqueUsername + '@example.com'
    Given path '/api/user/register'
    And request
      """
      {
    "username": "#(uniqueUsername)",
    "password": "initial",
    "name": "Admin2",
    "surname": "Adminovski",
    "email": "#(uniqueEmailAdmin)",
    "phone": "0000",
    "role": "ROLE_ADMIN"
    }
    """
    When method post
    Then status 200
    And match response contains { username: "#(uniqueUsername)" }
    * def usernameAdmin = response.username

    # ===== GET BY USERNAME (admin) =====
    * header Authorization = 'Bearer ' + adminToken
    Given path '/api/user', usernameAdmin
    When method get
    Then status 200
    And match response.username == usernameAdmin

    # ===== EDIT (keep ROLE_ prefix) =====
    * header Authorization = 'Bearer ' + adminToken
    Given path '/api/user/edit', usernameAdmin
    And request { "username": "#(usernameAdmin)", "email": "edited@test.com", "role": "ROLE_COURIER" }
    When method put
    Then status 200
    And match response.email == 'edited@test.com'

    # ===== LIST ALL (ensure admin header + correct variable) =====
    * header Authorization = 'Bearer ' + adminToken
    Given path '/api/user/users'
    When method get
    Then status 200
    And match response[*].username contains usernameAdmin

    # ===== DELETE =====
    * header Authorization = 'Bearer ' + adminToken
    Given path '/api/user/delete', usernameAdmin
    When method delete
    Then status 200

    # ===== VERIFY DELETED =====
    * header Authorization = 'Bearer ' + adminToken
    Given path '/api/user', usernameAdmin
    When method get
    Then status 404

  # Negative: Register duplicate username (must send full schema; use same username twice)
  Scenario: Register duplicate username
    * def dupeU = 'dupe_' + java.util.UUID.randomUUID().toString().substring(0,6)
    * def dupeE = dupeU + '@example.com'
    Given path '/api/user/register'
    And request
      """
      {
    "username": "#(dupeU)",
    "password": "pass",
    "name": "Dup",
    "surname": "User",
    "email": "#(dupeE)",
    "phone": "0000",
    "role": "ROLE_CUSTOMER"
    }
    """
    When method post
    Then status 200

    # second attempt with SAME username (new email to isolate username-unique rule, if any)
    * def dupeE2 = dupeU + '+2@example.com'
    Given path '/api/user/register'
    And request
      """
      {
    "username": "#(dupeU)",
    "password": "pass",
    "name": "Dup",
    "surname": "User",
    "email": "#(dupeE2)",
    "phone": "0000",
    "role": "ROLE_CUSTOMER"
    }
    """
    When method post
    Then status 403

  # Update: Admin can change password when editing a user
  #
  # The UserServiceImpl.update() method only updates the password if the
  # provided password is not null and not blank.  This scenario covers the
  # true branch of that predicate by updating a user and providing a
  # non‑blank password.  After the update the user should be able to
  # authenticate with the new password.
  Scenario: Admin updates a user with a new password
    * header Authorization = 'Bearer ' + adminToken
    * def uniquePassUser = 'testpass_' + java.util.UUID.randomUUID().toString().substring(0,8)
    * def uniquePassEmail = uniquePassUser + '@example.com'
    # create a new customer
    Given path '/api/user/register'
    And request
      """
      {
    "username": "#(uniquePassUser)",
    "password": "initial",
    "name": "Password",
    "surname": "Changer",
    "email": "#(uniquePassEmail)",
    "phone": "0000",
    "role": "ROLE_CUSTOMER"
    }
    """
    When method post
    Then status 200
    # update the user's email and set a new password
    * header Authorization = 'Bearer ' + adminToken
    Given path '/api/user/edit', uniquePassUser
    And request { "username": "#(uniquePassUser)", "email": "edited@example.com", "role": "ROLE_CUSTOMER", "password": "newpass" }
    When method put
    Then status 200
    # verify the password was updated by logging in with the new credentials
    Given path '/api/user/login'
    And request { "username": "#(uniquePassUser)", "password": "newpass" }
    When method post
    Then status 200


