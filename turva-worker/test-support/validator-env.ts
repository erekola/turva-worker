// Tek-910: the hosted llms.txt validator fails closed without its two rate-limit bindings
// (VALIDATOR_LIMITER and VALIDATOR_HOST_LIMITER), so every test that validates an external host
// passes this environment. The stubs allow everything; a test of the limits builds its own.
// This folder sits outside test/ on purpose: node --test runs every file under test/ as a test file.
const allow = { limit: async (_options: { key: string }) => ({ success: true }) };

export function validatorEnv() {
  return { VALIDATOR_LIMITER: allow, VALIDATOR_HOST_LIMITER: allow };
}
