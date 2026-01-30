@ignore
Feature: Authentication and token retrieval

  Background:
    * def creds = call read('classpath:karate/tests/auth/basic-auth.js') { user: '#(user)' }
    * url 'http://localhost:8080'
    * configure headers = { Accept: '*/*', 'Content-Type': 'application/json', Origin: 'http://localhost:8080' }

  Scenario: Get JWT token
    Given path '/api/user/login'
    And request { username: '#(creds.username)', password: '#(creds.password)' }
    When method post
    Then status 200
    And match response == { token: '#string' }

    * def authToken = response.token
    * karate.set('authToken', authToken)
    * print 'Retrieved JWT:', authToken
