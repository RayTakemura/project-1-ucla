$(document).foundation();

var apiKeyOW = "69b9ebd4d042c48c14532ef8693d871e";

var cityInput = "Los Angeles"

var openWeather = function (cityName) {

    // handling cities with spaces in their name
    var noSpaceCity = cityName.replace(" ", "+");
    console.log(noSpaceCity);

    var OWUrl ="https://api.openweathermap.org/data/2.5/forecast?q=" + noSpaceCity + "&appid=" + apiKeyOW + "&units=imperial";
    
    fetch(OWUrl).then(function(response) {
        // if statement for good and bad responses
        if (response.ok) {

            response.json().then(function(data) {
                // uncomment below if wanting to clear the forcast after each city is chosen
                // fiveDayForecastEl.innerHTML = "";
                console.log("OW URL function")
                console.log(data);

                // calling open city DB API
                var latitude = +34.05;
                var longitude = -118.24;
                geoCityDB(latitude, longitude);

                // for loop to make a forecast of 5 days
                for (var i = 0; i < 4; i++) {
                    // loop to get 4 days worth of forecast
                    var convertedIndex = (i*8);

                    // creation of each card holder
                    var dailyCard = document.createElement("div");

                    // TODO: Structure based on foundation
                    // dailyCard.className = "bg-primary col day-forecast";

                    // h4 date header
                    var dateEl = document.createElement("h4");
                    var dateReference = moment().add(i, "days").format("L");
                    dateEl.textContent = dateReference;
                    dailyCard.appendChild(dateEl);

                    // get weather for relevant icon
                    var forecastWeather = data.list[convertedIndex].weather[0].main;
                    // icons for the cards
                    var iconDiv = document.createElement("div");
                    if (forecastWeather === "Clear") {
                        iconDiv.innerHTML = "<i class='fas fa-sun'></i>"
                    } else if (forecastWeather === "Clouds") {
                        iconDiv.innerHTML = "<i class='fas fa-cloud'></i>"
                    } else if (forecastWeather === "Rain" || weather === "Drizzle") {
                        iconDiv.innerHTML = "<i class='fas fa-cloud-rain'></i>"
                    } else if (forecastWeather === "Thunderstorm") {
                        iconDiv.innerHTML = "<i class='fas fa-bolt'></i>"
                    } else if (forecastWeather === "Snow") {
                        iconDiv.innerHTML = "<i class='far fa-snowflake'></i>"
                    } else {
                        iconDiv.innerHTML = "<i class='fas fa-times-circle'></i>"
                    }
                    // append Icon to the card
                    dailyCard.appendChild(iconDiv);

                    //temperature div
                    var tempDiv = document.createElement("div");
                    tempDiv.textContent = "Temp: " + data.list[convertedIndex].main.temp + "°F";
                    dailyCard.appendChild(tempDiv);

                    //humidity
                    var humidityDiv = document.createElement("div");
                    humidityDiv.textContent = "Humidity: " + data.list[convertedIndex].main.humidity + "%";
                    dailyCard.appendChild(humidityDiv);

                    // append card to the 5 day forecast row

                    // TODO append to card holder
                    //fiveDayForecastEl.appendChild(dailyCard);
                }   
            })
        }
    })

}

var geoCityDB = function (lat, lon) {
    console.log("calling geoCityDB with" + lat + lon)
    fetch("https://wft-geo-db.p.rapidapi.com/v1/geo/adminDivisions?location=" + lat + lon, {
	"method": "GET",
	"headers": {
		"x-rapidapi-key": "b86f90e0b2msh50777cebadf2bf8p18ae10jsn2ea6375c04a8",
		"x-rapidapi-host": "wft-geo-db.p.rapidapi.com"
	}
})
.then(function(response) {
    if (response.ok) {
        response.json().then(function(data) {
            console.log(data);
        })
    }
})
.catch(err => {
	console.error(err);
});
    


}

openWeather(cityInput);