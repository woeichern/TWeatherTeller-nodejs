const axios = require('axios')
const moment = require('moment')
const constants = require('./constants');
const fs = require('fs');
const dotenv = require('dotenv')

dotenv.config();

let config_json = fs.readFileSync( __dirname + '/config.json');
let config = JSON.parse(config_json);

const time_zone_offset = process.env.TIME_ZONE_OFFSET
const line_notify_api_token = process.env.LINE_NOTIFY_API_TOKEN
const cwb_api_token = process.env.CWB_API_TOKEN

const line_notify_api_endpoint = 'https://notify-api.line.me/api/notify'
const cwb_api_endpoint = 'https://opendata.cwb.gov.tw/fileapi/v1/opendataapi'


function getCountryCodeByCountryName(country_name) {
    return config['country_name_to_code'][country_name];
}

async function getCountryWeatherData(country_code) {
    let url = cwb_api_endpoint + `/${country_code}?Authorization=${cwb_api_token}&format=JSON`;
    let res = await axios.get(url);

    return res.data;
}

function getFormatedTimeString(time) {
    return moment(time).utcOffset(time_zone_offset).format('MM-DD  HH:mm');
}

function getLocationData(location_raw_data, location_name)
{
    for (item of location_raw_data) {
        if (item.locationName === location_name) {
            return Object.assign({}, item);
        }
    }
}

function getLocationTemperatureData(location_data) {
    let result = [];

    for(let i = 1; i < 7; i++){
        const item = location_data['weatherElement'][constants.INDEX_LOCATION_WEATHER_ELEMENT_TEMPERATURE]['time'][i];

        result.push({
            value: item.elementValue.value,
            time: getFormatedTimeString(item.dataTime)
        });
    }

    return result;
}

function getLocationRainData(location_data) {
    let result = [];

    for(let i = 0; i < 3; i++){
        const item = location_data['weatherElement'][constants.INDEX_LOCATION_WEATHER_ELEMENT_RAIN]['time'][i];

        result.push({
            value: item.elementValue.value,
            time: getFormatedTimeString(item.startTime)
        });
    }

    return result;
}

async function getLocationWeatherData (location_name, country_name) {
    const country_code = getCountryCodeByCountryName(country_name);
    const country_weather_data = await getCountryWeatherData(country_code);
    const location_raw_data = country_weather_data.cwbopendata.dataset.locations.location;
    const location_data = getLocationData(location_raw_data, location_name);

    const location_weather_data = {
        location_name,
        country_name,
        temperature: getLocationTemperatureData(location_data),
        rain: getLocationRainData(location_data)
    };

    return location_weather_data;
}


function getLocationMessage(location_data) {
    let message = `\n${location_data.country_name}${location_data.location_name}\n未來18小時天氣預報\n`;

    message += `〈氣溫〉\n`;

    location_data.temperature.forEach((item) => {
        message += `[${item.time}]：${item.value}\n`;
    });

    message += '\n\n〈降雨機率〉\n';

    location_data.rain.forEach((item) => {
        message += `[${item.time}]：${item.value}\n`;
    });

    return message;
}

/*------------------------*/

async function main() {
    let list_to_notify = config.list_to_notify;

    for (item of list_to_notify) {
        const location_name = item.location_name;
        const country_name = item.country_name;

        const location_data = await getLocationWeatherData(location_name, country_name);
        const location_message = getLocationMessage(location_data);

        let data = new URLSearchParams();
        data.append('message', location_message);

        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${line_notify_api_token}`
        };

        axios({
            method: 'POST',
            url: line_notify_api_endpoint,
            data,
            headers
        });
    }
}

main();
