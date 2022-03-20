# TWeatherTeller-Node.js

## Description

This is a LINE Notifier to send notifications to your LINE, with temperature and rain percentage information subject to your setting!

## Get Started

### Environment Variables

- `LINE_NOTIFY_API_TOKEN`

    The token is used when sending LINE Notify request, and developer can get from [LINE Notify](https://notify-bot.line.me/).

- `CWB_API_KEY`

    The API key is used when sending request to get weather data from [Central Weather Burea Open API](https://opendata.cwb.gov.tw/index), and developer can get from [Central Weather Burea Open API](https://opendata.cwb.gov.tw/index) after registered.

- `TIME_ZONE_OFFSET`

    The time zone offset when calculate each time of weather value, and its format is like `+0800`, which is set to be a `GTM+8` time zone.

### Setting

Open `./config/notify_list.json` config file, which you can set what locations you want to set to get weather notification.

#### Example

```json
[
    {
        "country_name": "台北市",
        "location_name": "中山區"
    },
        {
        "country_name": "新竹縣",
        "location_name": "竹北市"
    },
    {
        "country_name": "新竹市",
        "location_name": "東區"
    },
]

```
You can find all country/county you can set from `./config/country.json` in `country_locations` fields, with the locations belong to it.

### Steps

- Clone this repository from GitHub
- Install packages
    ```bash
    npm install
    ```
- Initialize .env
    ```bash
    cp .env.example .env
    ```
- Set up each value in `.env`
- Set up the locations to notify in `./config/notify_list.json`

- Execute `main.js`
    ```bash
    node main.js
    ```