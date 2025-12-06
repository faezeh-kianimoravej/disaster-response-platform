# Incident Service – Load Test Report

## 1. Purpose

The purpose of this load test is to evaluate whether the **Incident Service**
meets its **performance and availability quality attributes** under concurrent usage.

This test focuses on the **incident creation endpoint** (`POST /api/incidents`),
which represents a critical entry point in the disaster response workflow.
If incident creation becomes slow or unavailable, downstream processes such as
alert dissemination and resource coordination cannot proceed.

---

## 2. Test Environment

- **Tool:** Apache JMeter 5.6.3
- **Environment:** Local development environment
- **Service under test:** Incident Service
- **Endpoint:** `POST /api/incidents`
- **Protocol:** HTTP

> Note: This test was executed in a local environment using a single service
instance and therefore represents a **baseline performance scenario**.

---

## 3. Test Scenario

| Parameter | Value |
|----------|-------|
| Concurrent users | 50 |
| Ramp-up time | 20 seconds |
| Requests per user | 5 |
| Total requests | 250 |
| Request method | HTTP POST |
| Assertion | HTTP 201 Created |

Each virtual user simulates reporting an incident.
A response assertion ensures only successful incident creations
(`HTTP 201 Created`) are considered valid.

---

## 4. Quality Attributes and Fitness Function

### Quality Attributes

- **Performance:** The service should process incident creation requests within
  acceptable response times under concurrent load.
- **Availability:** The service should remain available and respond without
  errors during the test.

### Fitness Function

The system is considered to satisfy its quality attributes if:

- **95th percentile (P95) response time ≤ 500 ms**
- **Error rate = 0%**

---

## 5. Test Results

### Summary Metrics

| Metric | Result |
|------|--------|
| Total requests | 250 |
| Average response time | 173 ms |
| Median response time | 28 ms |
| 90th percentile | 97 ms |
| **95th percentile (P95)** | **143 ms** |
| Error rate | **0.00%** |
| Throughput | ~12.8 requests/sec |

### Result Status

✅ **PASS**

The Incident Service successfully processed all requests within the defined
performance thresholds and without errors.

---

### JMeter Results Evidence

The following figures provide objective evidence of the test execution
and validate the reported metrics.

![JMeter Summary Report](images/summary-report.png)  
*Figure 1: JMeter Summary Report showing zero errors and stable response times under concurrent load.*

![JMeter Aggregate Report](images/aggregate-report.png)  
*Figure 2: JMeter Aggregate Report highlighting percentile-based response time distribution.*

---

## 6. Interpretation

The results demonstrate that the Incident Service can handle **50 concurrent
incident creation requests** while maintaining low latency and zero error rates.

Although a small number of requests showed higher response times (as visible in
the higher percentiles and maximum response time), the **P95 latency**, which
serves as the primary performance indicator, remained well below the defined
threshold. Such outliers are expected in local environments due to JVM warm-up
effects and temporary resource contention.

---

## 7. Scope and Limitations

- This test represents a **baseline load test**, not a stress test.
- The test was executed in a **local development environment**, not in a
  production-like distributed setup.
- Higher concurrency levels (e.g. 100+ users) were intentionally not tested in
  this iteration to avoid environment-induced distortions.

Future work may include stress testing or endurance testing in a
production-like environment.

---

## 8. Conclusion

This load test confirms that the **Incident Service meets its performance and
availability requirements under normal concurrent usage**. The service
satisfies the defined fitness function and can be considered fit for its role
within the disaster response system.

---

## Related Files

- `incident-creation-load-test.jmx`
- `README.md` (execution instructions)
- `images/summary-report.png`
- `images/aggregate-report.png`
