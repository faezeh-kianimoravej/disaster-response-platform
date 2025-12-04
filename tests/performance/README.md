# Incident Performance Test (JMeter)

This folder contains performance tests for the Incident Service using Apache JMeter.

## 📌 Test Included
- **performance-test-incidents.jmx**  
  Load test for creating new incidents (`POST /api/incidents`).

## 🚀 How to Run
1. Install **Apache JMeter 5.6.3**
2. Open JMeter GUI
3. Load the file:  
   `tests/performance/performance-test-incidents.jmx`
4. Start your local environment (`docker-compose-dev.yml`)
5. Click **Start** to run the test.

## ⚙️ Test Configuration
- **50 Threads (users)**
- **Ramp-up: 20 seconds**
- **Loop Count: 5**
- ~250 POST requests total

## 🎯 Purpose
This test measures:
- Response time of creating incidents
- System stability under moderate load
- Validation of API behavior under concurrent requests

