function detectAWD(satelliteData) {
  let floodDryCycles = 0;
  let currentlyFlooded = false;
  let previousFlooded = null;
  let falseSignals = 0;
  
  let dryDurationCounter = 0;
  const dryDurations = [];
  let totalWeeks = satelliteData.length;
  let floodedWeeks = 0;

  for (let i = 0; i < satelliteData.length; i++) {
    const data = satelliteData[i];
    const isFlooded = data.ndwi > 0;
    
    if (isFlooded && data.eventType === 'RAIN_EVENT') {
      falseSignals++;
      continue; 
    }

    if (isFlooded) {
      floodedWeeks++;
      if (dryDurationCounter > 0) {
        dryDurations.push(dryDurationCounter);
        dryDurationCounter = 0;
      }
    } else {
      dryDurationCounter++;
    }

    if (previousFlooded !== null && previousFlooded !== isFlooded) {
      if (!isFlooded) {
        floodDryCycles++;
      }
    }
    
    previousFlooded = isFlooded;
  }
  
  if (dryDurationCounter > 0) {
    dryDurations.push(dryDurationCounter);
  }

  const avgDryDuration = dryDurations.length > 0 
    ? dryDurations.reduce((a, b) => a + b, 0) / dryDurations.length 
    : 0;
  const floodingFraction = totalWeeks > 0 ? floodedWeeks / totalWeeks : 0;

  const awdDetected = floodDryCycles >= 2;
  
  let confidenceScore = awdDetected ? 70 + (floodDryCycles * 5) - (falseSignals * 2) : 40 - (falseSignals * 2);
  confidenceScore = Math.max(0, Math.min(100, confidenceScore));

  return {
    awdDetected,
    confidenceScore,
    observationsCount: satelliteData.length,
    floodingFraction,
    dryingCycles: floodDryCycles,
    avgDryDuration
  };
}

module.exports = { detectAWD };
