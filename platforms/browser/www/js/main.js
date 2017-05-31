(function($) {
  var API_URL = "http://dev-serveur.fr/vosgesemoi2017/wp-json/wp/v2/";
  var TEMPLATES_FOLDER = 'Mustache_Templates/';
  var restaurants_template;
  var hebergements_template;
  var activites_template;
  var events_template;
  var single_template;
  var jsonData = {};
  $.support.cors = true;

  function init() {
    AOS.init();
  }

  function showScreen(target) {
    try {
      if (target.length == 1) {
        if (target.not('.active')) {
          var activeElement = $('main .screen.active');
          if (activeElement.length == 1) {
            var newZI = activeElement.css("z-index") - 1;
            //activeElement.css("z-index", newZI);
            activeElement.removeClass('active');
            target.addClass('active');
          } else {
            target.addClass('active');
          }
        }
      }
    } catch(err) {
      console.log(err);
    }
  }

  function removeOtherElementsClass(targetedElementsName, targetedClass) {
    try {
      var targetedElements = $(targetedElementsName + '.' + targetedClass);
      if (targetedElements.length == 1) {
        targetedElements.removeClass(targetedClass);
      }
      if (targetedElements.length > 1) {
        $.each(targetedElements, function(el, index) {
          $(el).removeClass(targetedClass);
        });
      }
    } catch(err) {
      console.log(err);
    }
  }

  function changeContent(e) {
    try {
      var el = $(this);
      var target = $(el.data('target'));
      if (target.not('.selected')) {
        removeOtherElementsClass('footer button', 'selected');
        $('.home-screen').addClass('screen');
        el.addClass('selected');
        showScreen(target);
      }
    } catch(err) {
      console.log(err);
    }
  }

  function returnHome() {
    try {
      removeOtherElementsClass('footer button', 'selected');
      showScreen($('.home-screen'));
    } catch(err) {
      console.log(err);
    }
  }

  function getItem(itemName) {
    if (typeof(Storage) !== "undefined") {
        if (localStorage.getItem(itemName)) {
          return localStorage.getItem(itemName);
        } else {
          return (null);
        }
    } else {
        console.error("WEB STORAGE IS NOT AVAILABLE IN YOUR SYSTEM");
        return (null);
    }
  }

  function setItem(itemName, value) {
    if (typeof(Storage) !== "undefined") {
      try {
        localStorage.setItem(itemName, value);
        return (true);
      } catch(err) {
        if (err) {
          return (false);
        } else {
          return (true);
        }
      }
    }
  }

  function readLocalFile(filePath, Template, target, jsonData) {
    $.get({
      url : filePath
    })
    .done(function(fileContent) {
        console.log(fileContent);
        var rendered = Mustache.render(fileContent, jsonData);
        console.log(rendered);
        target.html(rendered);
    });
  }

  /** Converts numeric degrees to radians */
  if (typeof(Number.prototype.toRad) === "undefined") {
    Number.prototype.toRad = function() {
      return this * Math.PI / 180;
    }
  }

  function distance(lon1, lat1, lon2, lat2) {
    try {
      var R = 6371; // Radius of the earth in km
      var dLat = (lat2-lat1).toRad();  // Javascript functions in radians
      var dLon = (lon2-lon1).toRad();
      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      var d = R * c; // Distance in km
      return (Math.round(d * 100) / 100).toFixed(2);
    } catch(err) {
      if (err) {
        console.log(err);
        return null;
      }
    }
  }

  function getGeolocation(geoCoords) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(myPos) {
        geoCoords.map(function(idx, geoCoord) {
          var dist = distance(myPos.coords.longitude, myPos.coords.latitude, $(geoCoord).data('lng'), $(geoCoord).data('lat'));
          if (dist != null)
            $(geoCoord).html("Situé à " + dist + "Km");
        });
      });
    }
  }

  function makePhoneCall(tel) {
    console.log(tel.replace('tel:', 'tel://'));
      window.location.href = tel.replace('tel:', 'tel://');
  }

  //[LOAD CONTENT PART]
function loadArticles() {
  $.getJSON(API_URL + "posts?per_page=99")
  .done(function(data) {
    jsonData['posts'] = data;
    if (typeof events_template === "undefined") {
      $.get(TEMPLATES_FOLDER + 'posts.mst')
      .done(function(template) {
        events_template = template.toString();
        var rendered = Mustache.render(events_template, jsonData);
        var content = document.createElement('div');
        content.className = "content";
        $(content).html(rendered);
        $('#agenda').append(content);
      });
    }
  });
}

  function loadCategory(cname, template) {
    console.log(cname);
    $.getJSON(API_URL + cname + "?per_page=99")
    .done(function(data) {
      jsonData[cname] = data;
      jsonData[cname] = jsonData[cname].map(function(r) {
        console.log(unescape(r.title.rendered));
        r.acf.telephone = r.acf.telephone.replace(/ /g, "");
        return r;
      });
      data = null;
      if (typeof template === "undefined") {
        $.get(TEMPLATES_FOLDER + cname + '.mst')
        .done(function(data) {
          template = data.toString();
          var rendered = Mustache.render(template, jsonData);
          var content = document.createElement('div');
          content.className = "content";
          $(content).html(rendered);
          $('#' + cname).append(content);
          getGeolocation($('#' + cname + ' .' + cname + '.distance'));
          $('.' + cname + '.category .thumbnail').click(loadSingleTemplate);
          //$('.' + cname + '.category .name').click(loadSingleTemplate);
          $('.' + cname + '.category .phone').click(function(e) {
            e.preventDefault();
            makePhoneCall($(this).attr('href'));
          });
        });
      }
        //readLocalFile(TEMPLATES_FOLDER + 'custom_post_type.mst', custom_post_type_template, $('#hebergements'), data);
      else {
        console.log("fuck");
      }
    });
  }
  //[/LOAD CONTENT PART]
  //[SINGLE PART]
  function findOtherType(id, typeFilter) {
    var ret = [];
    for (prop in jsonData) {
      if (prop !== typeFilter) {
        console.log(jsonData);
        ret.push(_.find(jsonData[prop], function(row) {
          return (row.acf.adherent_responsable_de_cette_fiche.ID == id);
        }));
      }
    }
    if (ret.length == 0)
      return null;
    ret = _.filter(ret, function(r) {
      return (typeof r !== "undefined");
    });
    ret = ret.map(function(el) {
      if (typeof el === "object") {
        el.inf_name = el.type.substring(0, el.type.lastIndexOf('s'));
        if (el.type == "restaurants") {
          el.comeSee = "Voir la fiche du restaurant";
          el.icon = "fa fa-cutlery fa-3x";
        } else if (el.type == "hebergements") {
          el.comeSee = "Voir la fiche de l'hébergement";
          el.icon = "fa fa-bed fa-3x";
        } else if (el.type == "activites") {
          el.comeSee = "Voir la fiche de l'hébergement";
          el.icon = "fa fa-eye fa-3x";
        }
        return el;
      }
    });
    return (ret);
  }

  function findArticles(id) {
    var ret = [];

  }

  function deleteSingle() {
    var singleDiv = $(this).parent().parent();
    singleDiv.addClass('disappearFromRight');
    setTimeout(function() {
      singleDiv.remove();
      $('footer').show();
    }, 250);
  }

  function scrollInSingle() {
    var target = $($(this).data('target'));
    console.log(target);
    var offsetTop = target.offset().top;
    console.log(offsetTop);
    $('#' + type + ' .single').animate({ scrollTop: offsetTop }, 750);
    return false;
  }

  function loadSingleTemplate() {
    _this = $(this).parent();
    console.log(_this);
    var id = _this.attr('id');
    var type = _this.data('type');
    var single;
    var single_container;
    if ((typeof id !== "undefined") && (typeof type !== "undefined")) {
      single = _.find(jsonData[type], function(row) {
        return (row.id == id);
      });
      single.otherType = findOtherType(single.acf.adherent_responsable_de_cette_fiche.ID, single.type);
      console.log(single.otherType);
      single.inf_name = single.type.substring(0, single.type.lastIndexOf('s'));
      if (typeof single != "undefined") {
        single_container = document.createElement('div');
        single_container.className = "single single_" + type;
        $.get(TEMPLATES_FOLDER + 'single.mst')
        .done(function(data) {
          single_template = data.toString();
          var rendered = Mustache.render(single_template, single);
          $(single_container).html(rendered);
          $('#' + type).append(single_container);
          $('footer').hide();
          //$('.single .single_nav div').click(showSingleInfos);
          setTimeout(function() {
            $('#' + type + ' .single').addClass('appearFromRight');
          }, 10);
          $('#' + type + ' .single .single_nav div').click(scrollInSingle);
          $('#' + type + ' .single .gallery .seeMore').click(function() {
            $(this).parent().find('a')[0].click();
          });
          $('#' + type + ' .single .topbar .leaveSingle').click(deleteSingle);
        });
      }
    }
  }
  //[SINGLE PART]
  //[NAVIGATION PART]
  $('footer button').click(changeContent);
  $('.topbar .returnHome').click(returnHome);
  //[/NAVIGATION PART]

  //[INTRO PART]
  $('#intro-slick').slick({
		dots: true,
		arrows: false,
    infinite: false,
    speed: 300,
    fade: true
	});
  var firstSwipe = true;
  $('#intro-slick').on('beforeChange', function(e, slickEL, curIdx, nxtIdx) {
    if (nxtIdx > 0) {
      $('#intro-slick .slick-dots').addClass('slick-dots-buttons');
      if (!firstSwipe)
        $('.intro-screen .rectangle').css('opacity', 1);
    } else {
      $('#intro-slick .slick-dots').removeClass('slick-dots-buttons');
      $('.intro-screen .rectangle').css('opacity', 0);
    }
  });
  $('#intro-slick').on('afterChange', function(e, slickEL, idx) {
    if (idx > 0 && firstSwipe) {
      firstSwipe = false;
      $('.intro-screen .rectangle').css('opacity', 1);
    }
  });
  $('#intro-slick .discover').click(function(e) {
    setItem('hasSeenIntro', true);
    $('.intro-screen').hide();
    $('.intro-screen').remove();
  });
  $(window).on('load', function() {
    try {
      var seenIntro = getItem('hasSeenIntro');
      if ((seenIntro != null) && (seenIntro)) {
        $('.intro-screen').remove();
      } else {
        $('.intro-screen').addClass('appearFromLeft');
      }
    } catch(err) {
      console.error(err);
    }
  });
  //[/INTRO PART]


  $(document).on('deviceready', function() {
    loadCategory('restaurants', restaurants_template);
    loadCategory('hebergements', hebergements_template);
    loadCategory('activites', activites_template);
    loadArticles()
  });
  init();
})( jQuery );
