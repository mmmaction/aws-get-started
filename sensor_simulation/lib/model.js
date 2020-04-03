const moment = require('moment')
function getNextMeasurementValue(datapoint) {

    let result = 0

    if (datapoint.dataType == "PSC") {
        if (datapoint.lastValue) {
            if (Math.random() > 0.75) {
                result = (datapoint.lastValue == 1) ? 0 : 1
            } else {
                result = datapoint.lastValue
            }
        } else {
            result = 0
        }
    } else if (datapoint.dataType == "TEMP") {

        if (datapoint.lastValue) {

            let delta = Math.random() / 10

            if (Math.random() > 0.5) {
                result = datapoint.lastValue + delta
            } else {
                result = datapoint.lastValue - delta
            }
        } else {
            result = 22.0
        }

    } else {
        //Air quality
        if (datapoint.lastValue) {

            let delta = Math.random() * 10

            if (Math.random() > 0.5) {
                result = datapoint.lastValue + delta
            } else {
                result = datapoint.lastValue - delta
            }

        } else {
            result = 81.0
        }
    }

    return result
}


function getInfluxRecord(bid, datapoint) {
    datapoint.lastValue = getNextMeasurementValue(datapoint)

    return {
        tags:
        {
            buildingId: bid,
            sensorId: datapoint.name,
            guid: datapoint.id,
            nodename: 'filler'
        },
        fields:
        {
            value: datapoint.lastValue,
            quality: 'normal'
        },
        timestamp: new Date().getTime()
    }
}

function getInfluxPoints(building) {

    let result = []

    for (var i = 0; i < building.floors.length; i++) {
        let floor = building.floors[i]
        for (var j = 0; j < floor.datapoints.length; j++) {
            result.push(getInfluxRecord(building.id, floor.datapoints[j]))
        }
    }

    return result
}

module.exports = {
    getInfluxPoints: getInfluxPoints
}
