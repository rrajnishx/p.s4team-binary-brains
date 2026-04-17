function calculateMethane(area, awdDetected) {
  const baselineCH4 = 1.30 * 120 * area;
  const scalingFactor = awdDetected ? 0.6 : 1.0;
  const actualCH4 = baselineCH4 * scalingFactor;
  const methaneSaved = baselineCH4 - actualCH4;
  const co2Equivalent = methaneSaved * 28;

  return {
    methaneSaved,
    baselineCH4,
    actualCH4,
    co2Equivalent
  };
}

module.exports = { calculateMethane };
