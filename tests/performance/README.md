# Performance Tests (JMeter)

This folder contains performance tests for the Disaster Response System using Apache JMeter.

## 📌 Tests Included

- **incident-creation-load-test.jmx**  
  Load test for incident operations:
  - Creating new incidents (`POST /api/incidents`)
  - Retrieving incidents by region (`GET /api/incidents/region/{regionId}`)

- **crisis-update-load-test.jmx**  
  Load test for incident status retrieval by responders (`GET /api/incidents/region/{regionId}`).

## 🚀 How to Run

1. Install **Apache JMeter 5.6.3**
2. Open JMeter GUI
3. Load the test file:
   - `tests/performance/incident-creation-load-test.jmx`
4. Start your local environment (`docker-compose-dev.yml`)
5. Click **Start** to run the test.

## ⚙️ Test Configuration

- **50 Threads (users)**
- **Ramp-up: 20 seconds**
- **Loop Count: 5**
- ~250 requests per operation (~500 total requests)

## 🎯 Purpose

These tests measure:

- Response time under load
- System stability under moderate concurrent load
- Validation of API behavior under concurrent requests
- Performance of critical user flows (incident creation, crisis updates)
