/**
 * Plugin: jquery.zWeatherFeed
 * http://www.zazar.net/developers/jquery/zweatherfeed/
 * 
 * Version: 1.0.2 fork 1.0
 * (c) Copyright 2010, Zazar Ltd
 * (c) Copyright 2011, tonybolzan.com
 * 
 * Description: jQuery plugin for display of Yahoo! Weather feeds
 * 
 * History:
 * 1.0.3f - Local images
 * 1.0.2f - Trasnlated to pt-BR
 * 1.0.2  - Correction to options / link
 * 1.0.1  - Added hourly caching to YQL to avoid rate limits
 *          Uses Weather Channel location ID and not Yahoo WOEID
 *          Displays day or night background images
 *
 **/

(function($){

	var row = 'odd';

	$.fn.jweather = function(locations, options) {	
	
		// Set pluign defaults
		var defaults = {
			unit: 'c',
			image: true,
			highlow: true,
			wind: true,
			link: true,
			showerror: true
		};  
		var options = $.extend(defaults, options); 
		
		// Functions
		return this.each(function(i, e) {
			var $e = $(e);
			
			// Add feed class to user div
			if (!$e.hasClass('weatherFeed')) $e.addClass('weatherFeed');

			// Check and append locations
			if (!$.isArray(locations)) return false;
			var count = locations.length;
			if (count > 10) count = 10;
			var locationid = '';
			for (var i=0; i<count; i++) {
				if (locationid != '') locationid += ',';
				locationid += "'"+ locations[i] + "'";
			}

			// Cache results for an hour to prevent overuse
			now = new Date();
					
			// Create Yahoo Weather feed API address
			var query = "select * from weather.forecast where location in ("+ locationid +") and u='"+ options.unit +"'";
			var api = 'http://query.yahooapis.com/v1/public/yql?q='+ encodeURIComponent(query) +'&rnd='+ now.getFullYear() + now.getMonth() + now.getDay() + now.getHours() +'&format=json&callback=?';

			// Send request
			//$.getJSON(api, function(data) {
			$.ajax({
				type: 'GET',
				url: api,
				dataType: 'json',
				success: function(data) {

					if (data.query) {
			
						if (data.query.results.channel.length > 0 ) {
							
							// Multiple locations
							var result = data.query.results.channel.length;
							for (var i=0; i<result; i++) {
							
								// Create weather feed item
								_callback(e, data.query.results.channel[i], options);
							}
						} else {

							// Single location only
							_callback(e, data.query.results.channel, options);
						}
					} else {
						if (options.showerror) $e.html('<p>Weather information unavailable</p>');
					}
				},
				error: function(data) {
					if (options.showerror)  $e.html('<p>Weather request failed</p>');
				}
			});

		});
	};

	// Function to each feed item
	var _callback = function(e, feed, options) {
		var $e = $(e);

		// Format feed items
		var wd = feed.wind.direction;
		if (wd>=348.75&&wd<=360){wd="N"};if(wd>=0&&wd<11.25){wd="N"};if(wd>=11.25&&wd<33.75){wd="NNE"};if(wd>=33.75&&wd<56.25){wd="NE"};if(wd>=56.25&&wd<78.75){wd="ENE"};if(wd>=78.75&&wd<101.25){wd="L"};if(wd>=101.25&&wd<123.75){wd="ESE"};if(wd>=123.75&&wd<146.25){wd="SE"};if(wd>=146.25&&wd<168.75){wd="SSE"};if(wd>=168.75&&wd<191.25){wd="S"};if(wd>=191.25 && wd<213.75){wd="SSO"};if(wd>=213.75&&wd<236.25){wd="SO"};if(wd>=236.25&&wd<258.75){wd="OSO"};if(wd>=258.75 && wd<281.25){wd="O"};if(wd>=281.25&&wd<303.75){wd="ONO"};if(wd>=303.75&&wd<326.25){wd="NO"};if(wd>=326.25&&wd<348.75){wd="NNO"};
		var wf = feed.item.forecast[0];
		
		// Determine day or night image
		wpd = feed.item.pubDate;
		n = wpd.indexOf(":");
		tpb = _getTimeAsDate(wpd.substr(n-2,8));
		tsr = _getTimeAsDate(feed.astronomy.sunrise);
		tss = _getTimeAsDate(feed.astronomy.sunset);

		if (tpb>tsr && tpb<tss) { daynight = 'd'; } else { daynight = 'n'; }

		// Add item container
		var html = '<div class="weatherItem '+ row +'"';
		if (options.image) html += ' style="background-image: url(img/jweather/'+ feed.item.condition.code + daynight +'.png); background-repeat: no-repeat;"';
		html += '>';
		
		// add pt-BR lang
		var condition_text = ["Tornado", "Tempestade tropical", "Furacão", "Tempestades severas", "Trovoadas", "Chuva e neve misturadas", "Chuva misturada com granizo", "Neve misturada com granizo", "Garoa congelante", "Garoa", "Chuva Gelada", "Chovendo", "Chovendo", "Flocos de neve", "Chuva com neve", "Neve com vento", "Neve", "Granizo", "Geada", "Poeira", "Nebuloso", "Neblina", "Enfumaçado", "Rajadas de vento", "Ventania", "Frio", "Nublado", "Muito nublado (noite)", "Muito nublado (dia)", "Parcialmente nublado (noite)", "Parcialmente nublado (dia)", "Claro (noite)", "Ensolarado", "Muito claro (noite)", "Muito claro (dia)", "Chuva e granizo misturado", "Quente", "Trovoadas isoladas", "Parcialmente nublado", "Parcialmente nublado", "Chuvas esparsas", "Neve pesada", "Dispersos períodos de neve", "Neve pesada", "Parcialmente nublado", "Chuva com trovoadas", "Chuva com neve", "Trovoadas isoladas"];
		condition_text[3200] = "Não disponível";

		// Add item data
		html += '<div class="weatherCity">'+ feed.location.city +'</div>';
		html += '<div class="weatherTemp">'+ feed.item.condition.temp +'&deg;'+ feed.units.temperature +'</div>';
		html += '<div class="weatherDesc">'+ condition_text[feed.item.condition.code] +'</div>';
		if (options.highlow) html += '<div class="weatherRange">Max: '+ wf.high +'&deg; Min: '+ wf.low +'&deg;</div>';
		if (options.wind) html += '<div class="weatherWind">Vento: '+ wd +' '+ feed.wind.speed +' '+ feed.units.speed +'</div>';
		if (options.link) html += '<div class="weatherLink"><a target="_blank" href="'+ feed.item.link +'">Previs&atilde;o Completa</a></div>';
		
		html += '</div>';

		// Alternate row classes
		if (row == 'odd') { row = 'even'; } else { row = 'odd';	}
		
		$e.append(html);
	};

	// Get time string as date
	var _getTimeAsDate = function(t) {
		
		d = new Date();
		r = new Date(d.toDateString() +' '+ t);

		return r;
	};
})(jQuery);
