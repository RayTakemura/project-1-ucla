$(document).foundation();

var apiKeyOW = "69b9ebd4d042c48c14532ef8693d871e";

var searchInputEl =document.getElementById("search-input");
var travelPathEl = document.getElementById("travel-path");
// false if the second search bar is showing. True if it's showing
var secondForm = false;

var travelList = {};


/**
 * Fetch weather data from openWeather API, and append all data into citiesData object.
 * Depending on whether this function was called to append data for the city to travel from or to, 
 * it changes the directory of where the data is going to be stored.
 * @param {string} cityName The name of the city that was entered by the user
 * @param {string} toOrFrom The function must be called with 'to' or 'from' to correctly store data in the correct object.
 */
var fetchOpenWeather = function (cityName, toOrFrom) {
    // handling cities with spaces in their name
    var noSpaceCity = cityName.replace(" ", "+");
    var OWUrl ="https://api.openweathermap.org/data/2.5/forecast?q=" + noSpaceCity + "&appid=" + apiKeyOW + "&units=imperial";
    fetch(OWUrl)
        .then(function(response) {
            // if statement for good and bad responses
            if (response.ok) {
                response.json()
                    .then(function(data) {

                        var cityName = data.city.name;
                        var lat = data.city.coord.lat;
                        var lon = data.city.coord.lon;

                        // achieve weather data for the cityFrom data
                        if (toOrFrom === 'from'){

                            // create weather cards
                            for (var i = 0; i < 4; i++) {
                                var convertedIndex = (i * 8);
                                var dateString = moment().add(i, "days").format("L");
                                var iconURL = "http://openweathermap.org/img/w/" + data.list[convertedIndex].weather[0].icon + ".png";
                                var tempStr = data.list[convertedIndex].main.temp;
                                var humidityStr = data.list[convertedIndex].main.humidity;
                                var $weatherCard = createWeatherCard (dateString, iconURL, tempStr, humidityStr, false)
                                $('.w-from').append($weatherCard);
                            }  

                            swapSearchToText(cityName);
                            createSearchBar('to');
                            fetchGeoCityDB(lat, lon, 'from');
                            fetchYelp(cityName, 'from');

                        } else if (toOrFrom === 'to'){  // achieve weather data for the cityTo data 

                            for (var i = 0; i < 4; i++) {
                                var convertedIndex = (i * 8);
                                var dateString = moment().add(i, "days").format("L");
                                var iconURL = "http://openweathermap.org/img/w/" + data.list[convertedIndex].weather[0].icon + ".png";
                                var tempStr = data.list[convertedIndex].main.temp;
                                var humidityStr = data.list[convertedIndex].main.humidity;
                                var $watherCard = createWeatherCard (dateString, iconURL, tempStr, humidityStr, true)
                                $('.w-to').append($watherCard);
                            }

                            fetchYelp(cityName, 'to');
                            
                        } else {
                            console.log('make sure to enter "to" or "from" when you call fetchOpenWeather function!')
                            return;
                        }
                        
                    })

            // error handling for bad responses
            } else {
                alert("Error: " + response.status);
            }
        })
    // catch error if there is an exception
    .catch(function(error) {
        // catch() getting chained onto the end of the then
        console.log("logic error in featchOpenWeather function :(")
    });
}


/**
 * Fetches a list of nearby cities from nearby cities by using geoCityDB's API.
 * @param {number} lat The latitude of the city 
 * @param {number} lon The longitude of the city
 */
var fetchGeoCityDB = function (lat, lon) {
    console.log("calling geoCityDB with" + lat + lon)
    fetch("https://wft-geo-db.p.rapidapi.com/v1/geo/locations/" + lat + lon +"/nearbyCities?radius=100&limit=5", {
        "method": "GET",
        "headers": {
            "x-rapidapi-key": "b86f90e0b2msh50777cebadf2bf8p18ae10jsn2ea6375c04a8",
            "x-rapidapi-host": "wft-geo-db.p.rapidapi.com"
        }
    })
    .then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                var recCities = [];
                
                for (var i = 2; i < 5; i++){// limit recommended searches to 3
                    console.log(data.data[i].city);
                    // citiesData.cityFrom.recCities.push(data.data[i].city);
                    recCities.push(data.data[i].city);
                }
                var $cityRecSpanEl = $('<span>')
                    .text('Recommended cities: ')
                    .addClass('city-recommendation bullet cell small-2');
                $('.nearby-cities').append($cityRecSpanEl);
                for (var i = 0; i < 3; i++){
                    var $cityRecButtonEl = $('<a>')
                        .addClass('button radius info city-recommendation bullet cell small-1')
                        .text(recCities[i]);

                    $('.nearby-cities').append($cityRecButtonEl);
                }
            })
        }
    })
    .catch(err => {
        console.error(err);
    });
}


function fetchYelp(cityName, toOrFrom){
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer 9L0XxHNnQJiXPX5w0XuGqhOYZXx0CwmKc9sOc00ApKSApzvm0Etd3WpzKJL4T3zDRv0BotBJrUlPcHx140lZirnebjVbI45MD6KPNziXR1s1hXt2g51db7EwOhBdYHYx");
    
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };
    
    fetch("https://secure-shelf-42257.herokuapp.com/https://api.yelp.com/v3/businesses/search?location=" + cityName, requestOptions)
      .then(response => response.json())
      .then(result => {
          console.log(result);
          if (toOrFrom === 'from' || toOrFrom === 'to'){
            for(var i = 0; i < 4; i++){
                $('.y-' + toOrFrom).append(createYelpCard (result.businesses[i].name, result.businesses[i].image_url, toOrFrom === 'to'));
            }
          } else {
              console.log('you called the fetchYelp function incorrectly!')
          }
      })
      .catch(error => console.log('error', error));
}

var addToTheList = function (){
    console.log("add to the list function called")
}

/**
 * Creates a search form. It can prompt for the city to travel 'from' or 'to'.
 * @param {string} toOrFrom 'to' or 'from' depending on the situation.
 */
function createSearchBar(toOrFrom){
    var $promptEl = $('<li>')
        .addClass('bullet')
        .text("City that you're traveling " + toOrFrom + ": ");

    var $inputEl = $('<input>')
        .attr('type', 'search')
        .attr('placeholder', 'Search')
        .attr('id', 'search-input-' + toOrFrom);
    var $inputContainer = $('<li>');
    $inputContainer.append($inputEl);

    var $searchButton = $('<button>')
        .attr('type', 'submit')
        .addClass('button bullet')
        .attr('id', 'search-button')
        .text('Search');
    var $btnContainer = $('<li>');
    $btnContainer.append($searchButton);

    var $ulEl = $('<ul>')
        .addClass('menu search-form');
    $ulEl.append($promptEl)
        .append($inputContainer)
        .append($btnContainer);

    var $searchBoxEl = $('<div>')
        .addClass('grid-x grid-padding-x align-spaced')
        .attr('id', 'searchbox')
        .append($ulEl);

    var $formEl = $('<form>')
        .append($searchBoxEl);

    if (toOrFrom === 'from'){
        $inputEl.addClass('swappable');
        $searchButton.addClass('swappable');
        $('.trav-from').append($formEl);
        $formEl.attr('id','from');
    } else {
        $('.trav-to').append($formEl);
        $formEl.attr('id','to');
    }
}

/**
 * Swaps the first search bar into text form.
 * @param {string} cityName The name of the city in correct capitalization.
 */
function swapSearchToText (cityName){
    $('.swappable').remove();
    var $cityNameEl = $('<li>')
        .text(cityName)
        .addClass('bullet');
    $('ul').append($cityNameEl);
}

/**
 * 
 * @param {*} dateString 
 * @param {*} iconURL 
 * @param {*} tempStr 
 * @param {*} humidityStr 
 * @param {*} removable 
 * @returns 
 */
function createWeatherCard (dateString, iconURL, tempStr, humidityStr, removable){
    $date = $('<h4>').text(dateString);
    $icon = $('<img>').attr('src', iconURL);
    $temp = $('<span>').text("Temp: " + tempStr + "°F");
    $humidity = $('<span>').text("Humidity: " + humidityStr + "%")
    $cardSection = $('<div>')
        .addClass('card-section')
        .append($date)
        .append($icon)
        .append($temp)
        .append($humidity);
    $card = $('<div>')
        .addClass('card')
        .append($cardSection);
    if (removable){
        $card.addClass('removable');
    }
    return $card;

}


function createYelpCard (name, imgURL, removable){
    $name = $('<h4>').text(name);
    $img = $('<img>').attr('src', imgURL).attr('width', '150px');
    $cardSection = $('<div>')
        .addClass('card-section')
        .append($name)
        .append($img)
    $card = $('<div>')
        .addClass('card')
        .append($cardSection);
    if (removable){
        $card.addClass('removable');
    }
    return $card;
}

// When the web is loaded, create a search bar (the search bar will be deleted later)
createSearchBar('from');


$("body").submit(function(event) {
    event.preventDefault();
    if(event.target.matches('#from')){
        var searchInput = $('#search-input-from').val();
        fetchOpenWeather(searchInput,'from');
        
    }else if(event.target.matches('#to')){
        var searchInput = $('#search-input-to').val();
        fetchOpenWeather(searchInput,'to');
    }
});

// ready the function to accept button clicks of nearby cities
$('body').on('click', '.city-recommendation', function () {
    var buttonValue = $(this).html();
    console.log("the city is being called");
    console.log(buttonValue);

    fetchOpenWeather(buttonValue, 'to');
});
