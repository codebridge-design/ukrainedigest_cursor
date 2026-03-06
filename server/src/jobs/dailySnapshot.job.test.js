const test = require("node:test");
const assert = require("node:assert/strict");

const { computeCountrySelection } = require("./dailySnapshot.job");

test("computeCountrySelection keeps tier-1 countries and rotates tier-2", () => {
  const countries = [
    { iso2: "DE", tier: 1 },
    { iso2: "FR", tier: 1 },
    { iso2: "CA", tier: 2 },
    { iso2: "IN", tier: 2 },
    { iso2: "JP", tier: 2 },
  ];

  const first = computeCountrySelection(countries, {
    intervalMinutes: 180,
    dailyBudget: 24,
    rotationCursor: 0,
  });

  assert.equal(first.maxCountriesPerCycle, 3);
  assert.deepEqual(
    first.selectedCountries.map((country) => country.iso2),
    ["DE", "FR", "CA"],
  );

  const second = computeCountrySelection(countries, {
    intervalMinutes: 180,
    dailyBudget: 24,
    rotationCursor: first.nextRotationCursor,
  });

  assert.deepEqual(
    second.selectedCountries.map((country) => country.iso2),
    ["DE", "FR", "IN"],
  );
});

test("computeCountrySelection respects budget cap for 12 countries", () => {
  const countries = [
    "US",
    "CA",
    "GB",
    "DE",
    "FR",
    "PL",
    "TR",
    "IN",
    "JP",
    "AU",
    "BR",
    "ZA",
  ].map((iso2, index) => ({ iso2, tier: index < 4 ? 1 : 2 }));

  const result = computeCountrySelection(countries, {
    intervalMinutes: 180,
    dailyBudget: 90,
    rotationCursor: 0,
  });

  assert.equal(result.maxCountriesPerCycle, 11);
  assert.equal(result.selectedCountries.length, 11);
});
