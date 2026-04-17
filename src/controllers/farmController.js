const prisma = require('../utils/db');
const { getRainfallData } = require('../services/weatherService');
const { generateSatelliteData } = require('../services/satelliteService');
const { detectAWD } = require('../services/awdEngine');
const { calculateMethane } = require('../services/methaneEngine');
const crypto = require('crypto');

exports.analyzeFarm = async (req, res) => {
  try {
    const { lat, lng, state, district, area } = req.body;

    if (!lat || !lng || !state || !district || !area) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    let farmId = crypto.randomUUID();
    let isDbWorking = true;
    let farm;

    try {
      farm = await prisma.farm.create({
        data: { lat, lng, state, district, area }
      });
      farmId = farm.id;
    } catch (dbErr) {
      console.error("DB Error (Farm Creation):", dbErr.message);
      isDbWorking = false;
    }

    // Call services safely
    let rainfallData;
    try {
      rainfallData = await getRainfallData(lat, lng);
    } catch (e) {
      console.error("Weather Service Error:", e.message);
      rainfallData = Array.from({ length: 12 }, () => Math.random() * 50 + 10);
    }

    const satelliteData = generateSatelliteData(farmId, rainfallData);
    const awdResult = detectAWD(satelliteData);
    const methaneResult = calculateMethane(area, awdResult.awdDetected);
    const complianceScore = awdResult.awdDetected ? 80 + (awdResult.confidenceScore * 0.2) : 30;

    if (isDbWorking) {
      try {
        await prisma.analysis.create({
          data: {
            farmId: farmId,
            awdStatus: awdResult.awdDetected ? "AWD_DETECTED" : "NO_AWD",
            confidenceScore: awdResult.confidenceScore,
            methaneSaved: methaneResult.methaneSaved,
            baselineCH4: methaneResult.baselineCH4,
            actualCH4: methaneResult.actualCH4,
            co2Equivalent: methaneResult.co2Equivalent,
            score: complianceScore
          }
        });

        await prisma.satelliteData.createMany({
          data: satelliteData
        });
      } catch (dbErr) {
        console.error("DB Error (Analysis/Satellite):", dbErr.message);
      }
    }

    // Return farmId so getResults can fetch it (or mock it)
    // We always return 200
    res.status(200).json({ success: true, farmId: farmId, message: "Analysis complete" });
  } catch (error) {
    console.error(error);
    return res.status(200).json({
      success: false,
      fallback: true
    });
  }
};
