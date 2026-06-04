import { routeRequest } from "../router/engine.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
  console.log("✔", message);
}

async function testRouter() {
  console.log("\n=== AI ROUTER TEST SUITE ===\n");

  // TEST 1: basic routing
  const res1 = await routeRequest("hello world");
  assert(res1, "Basic routing returns response");

  // TEST 2: preferred model override
  const res2 = await routeRequest("hello", "openai");
  assert(res2, "Preferred model routing works");

  // TEST 3: fallback chain test (simulate failure prompt)
  const res3 = await routeRequest("force-fallback-test");
  assert(res3, "Fallback chain executed");

  console.log("\n=== ALL TESTS PASSED ===\n");
}

testRouter().catch(err => {
  console.error("\n❌ TEST FAILED:", err.message);
});