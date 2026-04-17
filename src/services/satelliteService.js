function generateSatelliteData(farmId, rainfallData) {
  const data = [];
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 12 * 7); // Start 12 weeks ago

  for (let i = 0; i < 12; i++) {
    const week = i + 1;
    let ndwi, ndvi, moisture, vvBackscatter, vhBackscatter, temperature;
    
    const rainfall = rainfallData[i] || 0;
    
    let isFlooded = false;
    if (week === 1 || week === 2 || week === 4) {
      isFlooded = true;
    } else if (week === 3 || week === 5) {
      isFlooded = false;
    } else {
      isFlooded = Math.random() > 0.5;
    }

    if (isFlooded) {
      ndwi = Math.random() * 0.4 + 0.1; // 0.1 to 0.5
      moisture = Math.random() * 20 + 80; // 80 to 100%
      vvBackscatter = Math.random() * -5 - 15; // -20 to -15 dB
    } else {
      ndwi = Math.random() * 0.4 - 0.5; // -0.5 to -0.1
      moisture = Math.random() * 30 + 30; // 30 to 60%
      vvBackscatter = Math.random() * -5 - 10; // -15 to -10 dB
    }

    ndvi = 0.2 + (i * 0.05) + (Math.random() * 0.1 - 0.05);
    if (ndvi > 0.9) ndvi = 0.9;

    vhBackscatter = vvBackscatter - 5 + Math.random() * 2;
    temperature = 25 + Math.random() * 10; 

    let eventType = "DRY";
    if (isFlooded) {
      if (rainfall > 15) {
        eventType = "RAIN_EVENT";
      } else {
        eventType = "IRRIGATION_EVENT";
      }
    }

    data.push({
      farmId,
      date: new Date(currentDate),
      ndvi,
      ndwi,
      moisture,
      rainfall,
      temperature,
      vvBackscatter,
      vhBackscatter,
      eventType
    });

    currentDate.setDate(currentDate.getDate() + 7); // Next week
  }

  return data;
}

module.exports = { generateSatelliteData };
