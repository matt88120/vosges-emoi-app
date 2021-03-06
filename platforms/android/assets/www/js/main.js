(function($) {
  const API_URL = "http://www.vosgesemoi.fr/wp-json/wp/v2/"
  var TEMPLATES_FOLDER = 'Mustache_Templates/';
  var restaurants_template;
  var hebergements_template;
  var activites_template;
  var posts_template;
  var single_template;
  var single_post_template;
  var markers_template;
  var photomaton_map_template;
  var common_map_template;
  var favorites_template;
  var maps = [];
  var favorites = [];


function donothing() {
  console.log("");
}

  /*
  *  new_map
  *
  *  This function will render a Google Map onto the selected jQuery element
  *
  *  @type	function
  *  @date	8/11/2013
  *  @since	4.3.0
  *
  *  @param	$el (jQuery element)
  *  @return	n/a
  */

  function new_map( $el, markerIcon ) {
    // var
    var $markers = $el.find('.marker');


    // vars
    var args = {
      zoom		: 16,
      center		: new google.maps.LatLng(0, 0),
      mapTypeId	: google.maps.MapTypeId.ROADMAP,
      draggable : false
    };


    // create map
    var map = new google.maps.Map( $el[0], args);

    google.maps.event.addListener(map, 'click', function(){
        map.setOptions({ draggable: true });
        setTimeout(function() {
          map.setOptions({ draggable: false });
        }, 15000);
    });
    // add a markers reference
    map.markers = [];


    // add markers
    $markers.each(function(){

        add_marker( $(this), map , markerIcon);

    });


    // center map
    center_map( map );


    // return
    return map;

  }

  /*
  *  add_marker
  *
  *  This function will add a marker to the selected Google Map
  *
  *  @type	function
  *  @date	8/11/2013
  *  @since	4.3.0
  *
  *  @param	$marker (jQuery element)
  *  @param	map (Google Map object)
  *  @return	n/a
  */

  function add_marker( $marker, map, markerIcon ) {

    // var
    var latlng = new google.maps.LatLng( $marker.attr('data-lat'), $marker.attr('data-lng') );

    // create marker
    var marker = new google.maps.Marker({
      position	: latlng,
      map			: map,
      icon		: markerIcon
    });

    // add to array
    map.markers.push( marker );

    // if marker contains HTML, add it to an infoWindow
    if( $marker.html() )
    {
      // create info window

      // show info window when marker is clicked
      google.maps.event.addListener(marker, 'click', function() {
        var type = $marker.data('type');
        if (typeof type !== "undefined") {
          if (type == "photomaton") {
            var author = $(this).data('author');
            var data = {
              thumbnail: $marker.data('url'),
              author: $marker.data('author')
            };
            if (typeof photomaton_map_template === "undefined") {
              loadTemplate('photomaton_map', photomaton_map_template).then(function(template) {
                try {
                  var rendered = Mustache.render(template, data);
                } catch (err) {
                  console.error(err);
                }
                $.fancybox.open({
                  src: rendered,
                  type: 'inline'
                });
                $('.fancybox-slide .seeSingle').click(loadSingleTemplateFromFancybox);
              });
            } else {
              try {
                var rendered = Mustache.render(photomaton_map_template, data);
              } catch (err) {
                console.error(err);
              }
              $.fancybox.open({
                src: rendered,
                type: 'inline'
              });
              $('.fancybox-slide .seeSingle').click(loadSingleTemplateFromFancybox);
            }
          } else {
            var data = {
              thumbnail: $marker.data('thumbnail'),
              id: $marker.data('id'),
              intro: $marker.data('intro'),
              phone: $marker.data('phone'),
              city: $marker.data('city'),
              name: $marker.data('name'),
              type: $marker.data('type')
            };
            if (typeof common_map_template === "undefined") {
              loadTemplate('common_map', common_map_template).then(function(template) {
                try {
                  var rendered = Mustache.render(template, data);
                } catch (err) {
                  console.error(err);
                }
                $.fancybox.open({
                  src: rendered,
                  type: 'inline'
                });
                $('.fancybox-slide .seeSingle').click(loadSingleTemplateFromFancybox);
              });
            } else {
              try {
                var rendered = Mustache.render(common_map_template, data);
              } catch(err) {
                console.error(err);
              }
              $.fancybox.open({
                src: rendered,
                type: 'inline'
              });
              $('.fancybox-slide .seeSingle').click(loadSingleTemplateFromFancybox);
            }
          }
        }
      });
    }

  }

  /*
  *  center_map
  *
  *  This function will center the map, showing all markers attached to this map
  *
  *  @type	function
  *  @date	8/11/2013
  *  @since	4.3.0
  *
  *  @param	map (Google Map object)
  *  @return	n/a
  */

  function center_map( map ) {

    // vars
    var bounds = new google.maps.LatLngBounds();

    // loop through all markers and create bounds
    $.each( map.markers, function( i, marker ){

      var latlng = new google.maps.LatLng( marker.position.lat(), marker.position.lng() );

      bounds.extend( latlng );

    });

    // only 1 marker?
    if( map.markers.length == 1 )
    {
      // set center of map
        map.setCenter( bounds.getCenter() );
        map.setZoom(12);
    }
    else
    {
      // fit to bounds
      map.fitBounds( bounds );
    }

  }

  function init() {
    setTimeout(function() {
        $("#animation-splash").addClass("hidden");
    }, 4000);
    setTimeout(function() {
        $("#animation-splash").removeClass("hidden").addClass("delete");
    }, 4500);
    AOS.init();
    FastClick.attach(document.body);
  }

  function get(url) {
    // Return a new promise.
    return new Promise(function(resolve, reject) {
      // Do the usual XHR stuff
      var req = new XMLHttpRequest();
      req.open('GET', url);
      if (typeof window.current_user !== "undefined") {
        req.setRequestHeader('Authorization', 'Bearer ' + window.current_user.token);
      }
      req.onload = function() {
        // This is called even on 404 etc
        // so check the status
        if (req.status == 200 || req.status == 0) {
          // Resolve the promise with the response text
          resolve(req.response);
        }
        else {
          // Otherwise reject with the status text
          // which will hopefully be a meaningful error
          console.error(req);
          reject(Error(req.statusText));
        }
      };

      // Handle network errors
      req.onerror = function() {
        reject(Error("Network Error"));
      };

        // Make the request
        req.send();
    });
  }

  function deleteOnServer(url) {
    // Return a new promise.
    return new Promise(function(resolve, reject) {
      // Do the usual XHR stuff
      var req = new XMLHttpRequest();
      req.open('DELETE', url);
      req.setRequestHeader('Authorization', 'Bearer ' + window.current_user.token);
      req.onload = function() {
        // This is called even on 404 etc
        // so check the status
        if (req.status == 200 || req.status == 0) {
          // Resolve the promise with the response text
          resolve(req.response);
        }
        else {
          // Otherwise reject with the status text
          // which will hopefully be a meaningful error
          console.error(req);
          reject(Error(req.statusText));
        }
      };

      // Handle network errors
      req.onerror = function() {
        reject(Error("Network Error"));
      };

        // Make the request
        req.send();
    });
  }

  function getJSON(url) {
    // Return a new promise.
    return new Promise(function(resolve, reject) {
      // Do the usual XHR stuff
      var req = new XMLHttpRequest();
      req.open('GET', url);
      if (typeof window.current_user !== "undefined") {
        req.setRequestHeader('Authorization', 'Bearer ' + window.current_user.token);
      }
      req.onload = function() {
        // This is called even on 404 etc
        // so check the status
        if (req.status == 200) {
          // Resolve the promise with the response text
          resolve(JSON.parse(req.response));
        }
        else {
          // Otherwise reject with the status text
          // which will hopefully be a meaningful error
          reject(Error(req.statusText));
        }
      };

      // Handle network errors
      req.onerror = function() {
        reject(Error("Network Error"));
      };

        // Make the request
        req.send();
    });
  }

  function returnHome() {
    try {
      $('.content-topbar .hamburger.is-active').click();
      if ($('.screen.active').hasClass('single')) {
        deleteSingle(true);
      } else if ($('.screen.active').hasClass('single_post')) {
        deleteSinglePost();
      } else if ($('.screen.active.favorites').length > 0) {
        leaveFavorites();
      } else {
        removeOtherElementsClass('footer button', 'selected');
        var current_screen = $(".screen.active");
        current_screen.removeClass("active left right").addClass("exit right");
        $('.content-topbar').addClass('inactive');
        $('.home-screen').addClass("active right");
        $('footer').show();
        setTimeout(function() {
            current_screen.removeClass("exit left right");
        }, 700);
      }
    } catch(err) {
      console.error(err);
    }
  }



  function deleteSinglePost() {
    $('.screen.exit').removeClass('exit left right').addClass('active right').show();
    $('.single_post.active').removeClass('active left right').addClass('exit right');
    $('.content-topbar .name').html("<h1>" + $('footer .selected div').last().html() + "</h1>");
    $('html, body').scrollTop(0);
    setTimeout(function() {
      $('.single_post').remove()
      $('footer').show();
    }, 400);
  }

  function deleteSingle(scroll) {
    if ((typeof window.prevSingleID !== "undefined") && (window.prevSingleID != $('.single.active').attr('id'))) {
      $('.single.active').removeClass('active left right').addClass('exit left');
      $('.content-topbar .single_nav').remove();
      $('#' + window.prevSingleID + ' .thumbnail').click();
      setTimeout(function() {
        $('.single.exit').remove();
      }, 400);
    } else {
      delete window.prevSingleID;
      $('.screen.exit').removeClass('exit left right').addClass('active right').show();
      $('.single.active').removeClass('active left right').addClass('exit right');
      $('.single_contacts').addClass('inactive');
      $('.single_contacts .single_phone').attr('href', "");
      $('.single_contacts .single_map').data('lat', '');
      $('.single_contacts .single_map').data('lng', '');
      if (typeof $('footer .selected div').last().html() !== "undefined") {
        $('.content-topbar .name').html("<h1>" + $('footer .selected div').last().html() + "</h1>");
      } else if (typeof $('.favorites_zone .fav_nav .showFilteredData').html() !== "undefined") {
        $('.content-topbar .name').html("<h1>" + $('.favorites_zone .fav_nav .showFilteredData').html() + "</h1>");
      } else {
        $('.content-topbar .name').html("");
      }
      $('.content-topbar .single_nav').remove();
    }
    $('.content-topbar').removeClass('scrolled');
    $('.content-topbar .name').show();
    if (scroll) {
      $('html, body').scrollTop(window.previousScroll);
    } else {
      $('html, body').scrollTop(0);
    }
    setTimeout(function() {
      $('.single.exit').remove();
      $('footer').show();
    }, 400);
  }

  function scrollInSingle() {
    var target = $($(this).data('target'));
    $('.single_nav .onglet_actif').removeClass('onglet_actif');
    $(this).addClass('onglet_actif');
    $('html, body').animate({ scrollTop: target.offset().top - 130 }, 750);
    return false;
  }

  function loadBG(Master) {
    setTimeout(function() {
      Master.find('.thumbnail').each(function(idx, el) {
        $(el).css('backgroundImage', "url(" + $(el).data('thumb') + ")")
        setTimeout(function() {
          $(el).find('.loadbg').hide();
        }, 3000);
      });
    }, 500);
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
      console.error(err);
    }
  }

  function changeContent(e) {
    try {
      var el = $(this);
      var target = el.data('target');
      if (!el.hasClass('selected')) {
        $('body').scrollTop(0);
        var current_screen = $(".screen.active");
        if (el.next('button.selected').length == 0) {
          current_screen.removeClass("active right left").addClass("exit left");
          $(target).addClass("active left");
          setTimeout(function() {
              current_screen.removeClass("exit left")
          }, 500);
        } else {
          current_screen.removeClass("active right left").addClass("exit right");
          $(target).addClass("active right");
          setTimeout(function() {
              current_screen.removeClass("exit right")
          }, 500);
        }
        removeOtherElementsClass('footer button', 'selected');
        el.addClass('selected');
        $('.content-topbar .name').html("<h1>" + $('footer .selected div').last().html() + "</h1>");
        $('.content-topbar').removeClass('inactive');
        loadBG($(target));
        if ($('.screen.active').attr('id') == "carte") {
          setTimeout(function() {
            navigator.notification.alert("Vous devez appuyer sur la carte pour vous déplacer.", donothing, 'Astuce', 'J\'ai compris.');
          }, 550);
          maps.map(function(map) {
            google.maps.event.trigger(map, 'resize');
            center_map(map);
          });
        }
      }
    } catch(err) {
      console.error(err);
    }
  }

  function distance(lon1, lat1, lon2, lat2) {
    try {
      if (typeof(Number.prototype.toRad) === "undefined") {
        Number.prototype.toRad = function() {
          return this * Math.PI / 180;
        }
      }
      var R = 6371; // Radius of the earth in km
      var dLat = (lat2 - lat1).toRad();  // Javascript functions in radians
      var dLon = (lon2 - lon1).toRad();
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c; // Distance in km
      return (Math.round(d * 100) / 100).toFixed(2);
    } catch(err) {
      if (err) {
        console.error(err);
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

  function navigateToDest(e) {
    e.preventDefault();
    try {
      var _this = $(this);
      if ((typeof _this.data('lat') !== "undefined") && (typeof _this.data('lng') !== "undefined")) {
        var dest = {
          lat: _this.data('lat'),
          lng: _this.data('lng')
        }
        navigator.geolocation.getCurrentPosition(function(userPos) {
          var start = userPos.coords.latitude + ", " + userPos.coords.longitude;
          launchnavigator.navigate([dest.lat, dest.lng], {
            start: start
          });
        }, function(err) {
          console.error(err);
        });
      }
    } catch(err) {
      console.error(err);
    }
  }

  function loadAndStore(name, args) {
    return new Promise(function(res, rej) {
      if (typeof args === "undeined")
        args = "";
      getJSON(API_URL + name + args).then(function(data) {
        if (typeof data !== "undefined") {
          localforage.setItem(name, data).then(function() {
            res(true);
          }).catch(function(err) {
            rej(err);
          });
        } else {
          res(false);
        }
      }).catch(function(err) {
        console.error(err);
        rej(err);
      });
    })
  }

  function loadTemplate(tName, tVar) {
    return (new Promise(function(res, rej) {
      get(TEMPLATES_FOLDER + tName + '.mst').then(function(data) {
        if (typeof data !== "undefined") {
          tVar = data.toString();
          res(tVar);
        }
      }).catch(function(err) {
        rej(err);
      });
    }));
  }

  function findOtherType(respID, type) {
    return new Promise(function(res, rej) {
      var commonTypes = ['activites', 'hebergements', 'restaurants'];
      var promises = [];
      if ((typeof respID !== "undefined") && (typeof type !== "undefined")) {
        promises = commonTypes.map(function(r) {
          if (r != type) {
            return (localforage.getItem(r));
          }
        });
        promises = _.filter(promises, function(r) {
          return (typeof r !== "undefined");
        });
        Promise.all(promises).then(function(data) {
          var resp = [];
          if (typeof data !== "undefined") {
            for (var i = 0; i < data.length; i++) {
              if (data[i] !== "undefined") {
                var ret;
                var ret = _.find(data[i], function(row) {
                  return (row.acf.adherent_responsable_de_cette_fiche.ID == respID);
                });
                if (typeof ret !== "undefined") {
                  if (ret.length) {
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
                    resp.push(ret);
                  } else if (typeof ret.length === "undefined") {
                    ret.inf_name = ret.type.substring(0, ret.type.lastIndexOf('s'));
                    if (ret.type == "restaurants") {
                      ret.comeSee = "Voir la fiche du restaurant";
                      ret.icon = "fa fa-cutlery fa-3x";
                    } else if (ret.type == "hebergements") {
                      ret.comeSee = "Voir la fiche de l'hébergement";
                      ret.icon = "fa fa-bed fa-3x";
                    } else if (ret.type == "activites") {
                      ret.comeSee = "Voir la fiche de l'hébergement";
                      ret.icon = "fa fa-eye fa-3x";
                    }
                    resp.push(ret);
                  }
                }
              }
            }
            if (resp.length) {
              res(resp);
            } else {
              res([]);
            }
          }
        });
      } else {
        res([]);
      }
    });
  }

  function findPosts(id) {
    var ret = {
      posts : []
    };
    var temp;
    return new Promise(function(res ,rej) {
      localforage.getItem('posts').then(function(data) {
        if (typeof data != "undefined") {
          ret.posts.push(_.find(data, function(row) {
            return (row.acf.auteur_de_lactualite.ID == id);
          }));
          ret.posts = _.filter(ret.posts, function(row) {
            return (typeof row !== "undefined");
          });
          if (ret.posts.length) {
            if (typeof posts_template !== "undefined") {
              res(Mustache.render(posts_template, ret));
            } else {
              loadTemplate('posts', posts_template).then(function(template) {
                res(Mustache.render(template, ret));
              }).catch(function(err) {
                console.error(err);
              });
            }
          } else {
            res([]);
          }
        }
      }).catch(function(err) {
        rej(err);
      });
    });
  }

  function shareSingle() {
    var single = $(this).parent().parent();
    var options = {
      message: (single.data('type') == "activites") ? 'J\'ai trouvé une superbe ' + single.data('type').substr(0, single.data('type').length - 1) + ' sur l\'application VosgesEmoi, regarde :' : 'J\'ai trouvé un superbe ' + single.data('type').substr(0, single.data('type').length - 1) + ' sur l\'application VosgesEmoi, regarde :' ,
      files: [$(this).data('thumbnail')],
      url: $(this).data('share')
    }
    var onSuccess = function(result) {
      navigator.notification.alert("Votre contenu a bien été partagé !", donothing, "Partage", "Merci !");
    }
    var onError = function(err) {
      navigator.notification.alert("Le partage de votre contenu a échoué !", donothing, "Partage", "D'accord");
    }
    window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
  }

  function loadSingleTemplate() {
    _this = $(this).parent();
    var id = _this.attr('id');
    var type = _this.data('type');
    var single;
    var single_container;
    localforage.getItem(type).then(function(data) {
      single = _.find(data, function(row) {
        return (id == row.id);
      });
      Promise.all([findOtherType(single.acf.adherent_responsable_de_cette_fiche.ID, single.type),
        findPosts(single.acf.adherent_responsable_de_cette_fiche.ID)]).then(function(d) {
          if (d[0].length)
            single.otherType = d[0];
          if (d[1].length) {
            single.posts = d[1];
            single.hasPosts = true;
          } else {
            single.hasPosts = false;
          }
          single.inf_name = single.type.substring(0, single.type.lastIndexOf('s'));
          single_container = document.createElement('div');
          $(single_container).addClass("single single_" + type + " screen active left");
          $(single_container).attr('id', id);
          $(single_container).data('type', type);
          $('.screen.active').removeClass('active left right').addClass('exit left');
          $('.content-topbar .name').hide();
          $('main').append(single_container);
          $('.single_contacts').removeClass('inactive');
          window.previousScroll = $('body').scrollTop();
          var reg = new RegExp(' ', 'g');
          $('.single_contacts .single_phone').attr('href', "tel:" + single.acf.telephone.replace(reg, ''));
          $('.single_contacts .single_phone').click(launchCall);
          $('.single_contacts .single_map').data('lat', single.acf.situation_sur_la_carte.lat.toString());
          $('.single_contacts .single_map').data('lng', single.acf.situation_sur_la_carte.lng.toString());
          $('.single_contacts .single_map').click(navigateToDest);
          setTimeout(function() {
            $('html, body').scrollTop(0);
            $('.screen.exit').hide();
          }, 400);
          if (typeof single_template === "undefined") {
            loadTemplate('single', single_template).then(function(template) {
              $('.single.active').html(Mustache.render(template, single));
              var tmp = _.find(favorites, function(row) {
                return row  == id;
              });
              if (tmp != null) {
                $('.single.active .fa-heart-o').removeClass('fa-heart-o').addClass('fa-heart');
              }
              $('.single.active .fav').click(addOrDeleteFavorites);
              $('.single.active .share').click(shareSingle);
              $('.content-topbar .name').html("");
              $('.single.active .single_name').find('h1').clone().appendTo($('.content-topbar .name'));
              $('.single.active .single_nav').clone().insertAfter('.content-topbar .name');
              $('.content-topbar .single_nav div').click(scrollInSingle);
              $(window).on('scroll', function() {
                if ($('.single.active').length > 0) {
                  var offsetTop = $('.single.active .single_name').offset().top + parseInt($('.single.active .single_name').css('height')) - 130;
                  offsetTop = Math.round(offsetTop);
                  var bodyScroll = $('body').scrollTop();
                  if (bodyScroll > offsetTop) {
                    $('.content-topbar').addClass('scrolled');
                    $('.content-topbar .single_nav').addClass('scrolled');
                    $('.content-topbar .name').show();
                  } else if (bodyScroll < offsetTop) {
                    $('.content-topbar').removeClass('scrolled');
                    $('.content-topbar .single_nav').removeClass('scrolled');
                    $('.content-topbar .name').hide();
                  }
                }
              });
              $('.single.active .relativePosts').append(single.posts);
              $('.single.active .relativePosts .post').click(openPost);
              //$('.single .single_name').scrollToFixed();
              $('.single.active .relativePosts').slick({
                dots: true,
            		arrows: false,
                infinite: false,
                speed: 300,
                centerMode: true,
                swipeToSlide: true,
                slidesToShow: 1
              });
              $('footer').hide();
              //$('.single .single_nav div').click(showSingleInfos);
              $('.single.active .single_nav div').click(scrollInSingle);
              $('.single.active .gallery .seeMore').click(function() {
                $(this).parent().find('a').fancybox();
                $(this).parent().find('a').eq(0).click();
              });
              $('.single.active .otherType .comeSee').click(loadSingleTemplateFromOtherType);
            }).catch(function(err) {
              console.error(err);
            });
          } else {
            $('.single.active').html(Mustache.render(single_template, single));
            var tmp = _.find(favorites, function(row) {
              return row  == id;
            });
            if (tmp != null) {
              $('.single.active .fa-heart-o').removeClass('fa-heart-o').addClass('fa-heart');
            }
            $('.single.active .fav').click(addOrDeleteFavorites);
            $('.content-topbar .name').html("");
            $('.single.active .single_name').find('h1').clone().appendTo($('.content-topbar .name'));
            $('.single.active .single_nav').clone().insertAfter('.content-topbar .name');
            $('.content-topbar .single_nav div').click(scrollInSingle);
            $(window).on('scroll', function() {
              if ($('.single.active').length > 0) {
                var offsetTop = $('.single.active .single_name').offset().top + parseInt($('.single.active .single_name').css('height')) - 130;
                var bodyScroll = $('body').scrollTop();
                if (bodyScroll > offsetTop) {
                  $('.content-topbar').addClass('scrolled');
                  $('.content-topbar .single_nav').addClass('scrolled');
                } else if (bodyScroll < offsetTop) {
                  $('.content-topbar').removeClass('scrolled');
                  $('.content-topbar .single_nav').removeClass('scrolled');
                }
              }
            });
            $('.single .relativePosts').append(single.posts);
            $('.single .relativePosts .post').click(openPost);
            //fixToTop($('.single .single_name'), $('.single'));
            $('.single .relativePosts').slick({
              dots: true,
              arrows: false,
              infinite: false,
              speed: 300,
              centerMode: true,
              swipeToSlide: true,
              slidesToShow: 1
            });
            $('footer').hide();
            //$('.single .single_nav div').click(showSingleInfos);
            $('.screen.active').removeClass('active left right').addClass('exit left');
            $('.single').addClass('active left');
            $('.single .single_nav div').click(scrollInSingle);
            $('.single .gallery .seeMore').click(function() {
              $(this).parent().find('a')[0].click();
            });
            $('.single .topbar .leaveSingle').click(deleteSingle);
            $('.single .otherType .comeSee').click(loadSingleTemplateFromOtherType);
          }
        }).catch(function(err) {
          console.error(err);
        });
      });
    }

  function loadSingleTemplateFromFancybox() {
    $('.content-topbar').removeClass('scrolled');
    var _this = this;
    $.fancybox.close();
    setTimeout(function() {
      loadSingleTemplate.apply(_this);
    }, 600);
  }

  function loadSingleTemplateFromOtherType() {
    $('.content-topbar').removeClass('scrolled');
    window.prevSingleID = $('.single.active').attr('id');
    $('.content-topbar .single_nav').remove();
    $('.single.active').removeClass('active left right').addClass('exit left');
    loadSingleTemplate.apply(this);
    setTimeout(function() {
      $('.single.exit').remove();
    }, 500);
    $('.html, body').scrollTop(0);
  }

  function loadSingleTemplateFromTitle() {
    var from = $(this).parent()[0];
    loadSingleTemplate.apply(from);
  }

  function launchCall(e) {
    e.preventDefault();
    var phoneNumber = $(this).attr('href');
    if ((typeof phoneNumber !== "undefined") && (phoneNumber.indexOf('tel:') >= 0)) {
      window.PhoneCaller.call(phoneNumber, function() {
        //navigator.notification.alert("L'appel à bien été passé.", donothing, "Appel", "Merci !");
        donothing();
      }, function() {
        //navigator.notification.alert("L'appel n'a pas abouti.", donothing, "Appel", "Merci !");
        donothing();
      });
    }
  }

  function loadCommonContent(tName, tVar) {
    loadTemplate(tName, tVar).then(function(template) {
      localforage.getItem(tName).then(function(data) {
        data = data.map(function(el) {
          if (typeof el.acf.telephone != "undefined")
            el.acf.telephone = el.acf.telephone.replace(new RegExp(' ', 'g'), '');
          return (el);
        });
        try {
          var tab = {
            datas : data
          }
          var content = document.createElement('div');
          content.className = "content";
          try {
            $(content).html(Mustache.render(template, tab));
          } catch(err) {
            console.error(err);
          }
          $('#' + tName).append(content);
          getGeolocation($('#' + tName + ' .' + tName + ' .distance'));
          $('.' + tName + '.category .thumbnail').click(loadSingleTemplate);
          $('.' + tName + '.category .presentation').click(loadSingleTemplateFromTitle);
          $('.' + tName + '.category .contacts .marker').click(navigateToDest);
          $('.' + tName + '.category .phone').click(launchCall);
          $('.' + tName + ' .fa-heart-o').click(addOrDeleteFavorites);
          setTimeout(function() {
            $('.' + tName + '.category .thumbnail').find('.thumbnail').each(function(idx, el) {
              $(el).css('backgroundImage', "url(" + $(el).data('thumb') + ")")
            });
          }, 500);
        } catch(err) {
          console.error(err);
        }
      }).catch(function(err) {
        console.error(err);
      });
    });
  }

  function openPost() {
    var article_container = $(this);
    localforage.getItem('posts').then(function(data) {
      var article = _.find(data, function(row) {
        return (article_container.attr('id') == row.id);
      });
      if (typeof single_post_template === "undefined") {
        loadTemplate('single_post', single_post_template).then(function(template) {
          try {
            var container = document.createElement('div');
            $(container).addClass('single_post screen');
            $(container).attr('id', article.id);
            $('main').append(container);
            $('footer').show();
            $('.screen.active').removeClass('active').addClass('exit');
            $('.single_post').addClass('active');
            $('.single_post').html(Mustache.render(template, article));
          } catch(err) {
            console.error(err);
          }
        });
      } else {
        try {
          var container = document.createElement('div');
          $(container).addClass('single_post screen');
          $(container).attr('id', article.id);
          $('main').append(container);
          $('footer').show();
          $('.screen.active').removeClass('active').addClass('exit');
          $('.single_post').addClass('active');
          $('.single_post').html(Mustache.render(single_post_template, article));
        } catch(err) {
          console.error(err);
        }
      }
    });
  }

  function loadPosts() {
    if (typeof posts_template === "undefined") {
      loadTemplate('posts', posts_template).then(function(template) {
        localforage.getItem('posts').then(function(data) {
          var tmp = {
            posts: data
          }
          try {
            var content = document.createElement('div');
            content.className = "content";
            try {
              $(content).html(Mustache.render(template, tmp));
            } catch(err) {
              console.error(err);
            }
            $('#agenda').append(content);
            setTimeout(function() {
              $('#agenda .content .post').click(openPost);
              $('#agenda .topbar .returnHome').click(returnHome);
              $('#agenda .topbar .showFavorites').click(showFavorites);
              $('#agenda .content').slick({
                dots: true,
                arrows: false,
                infinite: false,
                speed: 300,
                centerMode: true,
                swipeToSlide: true
              });
            }, 300);
          } catch(err) {
            console.error(err);
          }
        });
      });
    } else {
      localforage.getItem('posts').then(function(data) {
        try {
          var content = document.createElement('div');
          content.className = "content";
          try {
            $(content).html(Mustache.render(posts_template, data));
          } catch(err) {
            console.error(err);
          }
          $('#agenda').append(content);
          setTimeout(function() {
            $('#agenda .content .post').click(openPost);
            $('#agenda .content').slick({
              dots: true,
              arrows: false,
              infinite: false,
              speed: 300,
              centerMode: true,
              swipeToSlide: true
            });
          }, 300);
        } catch(err) {
          console.error(err);
        }
      });
    }
  }

  function getPhotosMarkers() {
    var promises = [];
    localforage.getItem('photomaton').then(function(data) {
      if ((typeof data !== "undefined") && (data != null)) {
        for (var i = 0; i < data.length; i++) {
          if (typeof data[i])
            promises.push(getJSON(API_URL + 'users/' + data[i].author));
        }
        Promise.all(promises).then(function(users) {
          var mustData = {
            markers : [],
            isPhotos: true
          };
          for (var i = 0; i < data.length; i++) {
            var author = _.find(users, function(row) {
              return (row.id == data[i].author);
            });
            delete(users);
            data[i].author = {
              id: author.id,
              name: author.name
            };
          }
          mustData.markers = data;
          if (mustData.markers.length) {
            if (typeof markers_template === "undefined") {
              loadTemplate('markers', markers_template).then(function(template) {
                var photo_map
                $('#carte .content .photos').html(Mustache.render(template, mustData));
                maps.push(new_map($('#carte .content .photos'), 'img/pins/marker-photo.png'));
                setTimeout(function() {
                  maps.map(function(map) {
                    google.maps.event.trigger(map, 'resize');
                    center_map(map);
                  });
                }, 50);
              });
            } else {
              $('#carte .content .photos').html(Mustache.render(markers_template, mustData));
              maps.push(new_map($('#carte .content .photos'), 'img/pins/marker-photo.png'));
              setTimeout(function() {
                maps.map(function(map) {
                  google.maps.event.trigger(map, 'resize');
                  center_map(map);
                });
              }, 50);
            }
          }
        }).catch(function(err) {
          console.error(err);
        });
      }
    });
  }

  function getCommonMarkers(collectionName) {
    localforage.getItem(collectionName).then(function(data) {
      var mustData = {
        markers : data,
        isPhotos: false
      };
      if (mustData.markers.length) {
        if (typeof markers_template === "undefined") {
          loadTemplate('markers', markers_template).then(function(template) {
            try {
              $('#carte .content .' + collectionName).html(Mustache.render(template, mustData));
            } catch(err) {
              console.error(err);
            }
            maps.push(new_map($('#carte .content .' + collectionName), 'img/pins/marker-' + collectionName + '.png'));
            setTimeout(function() {
              maps.map(function(map) {
                google.maps.event.trigger(map, 'resize');
                center_map(map);
              });
            }, 50);
          });
        } else {
          try {
            $('#carte .content .' + collectionName).html(Mustache.render(markers_template, mustData));
          } catch(err) {
            console.error(err);
          }
          maps.push(new_map($('#carte .content .' + collectionName), 'img/pins/marker-' + collectionName + '.png'));
          setTimeout(function() {
            maps.map(function(map) {
              google.maps.event.trigger(map, 'resize');
              center_map(map);
            });
          }, 50);
        }
      }
    });
  }

  function changeMap() {
    if (!$(this).hasClass('active_map')) {
      $('#carte .chooseMap .active_map').removeClass('active_map');
      $(this).addClass('active_map');
      var current_map = $('#carte div.active_map');
      var target =   $('#carte div.' + $(this).data('target'));

      current_map.removeClass('active_map');
      target.addClass('active_map');
      setTimeout(function() {
        maps.map(function(map) {
          google.maps.event.trigger(map, 'resize');
          center_map(map);
        });
      }, 50);
    }
  }

  function loadMaps() {
    $('#carte .chooseMap span').click(changeMap);
    $('#carte .topbar .returnHome').click(returnHome);
    getPhotosMarkers();
    getCommonMarkers('restaurants');
    getCommonMarkers('hebergements');
    getCommonMarkers('activites');

  }

  function initFooter() {
    $('footer button').click(changeContent);
    $('.home-screen, #restaurants, #hebergements, #activites').each(function(idx, el) {
      var hamTmp = new Hammer(el);
      hamTmp.on('swipeleft', function(e) {
        if ($('footer .selected').length)
          $('footer .selected').next().click();
        else
          $('footer button').eq(0).click();
      });
    });
    $('#hebergements, #activites').each(function(idx, el) {
      var hamTmp = new Hammer(el);
      hamTmp.on('swiperight', function(e) {
        $('footer .selected').prev("button").click();
      });
    });
  }

  function loadAllContent() {
    Promise.all([loadAndStore('restaurants', '?per_page=99'),
    loadAndStore('hebergements', '?per_page=99'),
    loadAndStore('activites', '?per_page=99'),
    loadAndStore('posts', '?per_page=99'),
    loadAndStore('photomaton', '?per_page=99')]).then(function(values) {
      if (typeof values != "undefined") {
        for (var i = 0; i < values.length; i++) {
          if (!values[i])
            throw new Error("data didn't stored correctly");
        }
        localforage.setItem('lastLoadedDate', new Date()).then(function() {
          justGetLocalContentWithExternalImages();
        });
      }
    }).catch(function(err) {
      console.error(err);
    });
  }

  function justGetLocalContentWithExternalImages() {
    try {
      loadCommonContent('restaurants', restaurants_template);
      loadCommonContent('hebergements', hebergements_template);
      loadCommonContent('activites', activites_template);
    } catch (err) {
      console.error(err);
    }
    if (window.navigator.onLine) {
      loadAndStore('photomaton', '?per_page=99').then(function(data) {
        loadMaps();
      });
    }
    setTimeout(function() {
      getFavorites();
    }, 1000);
    loadPosts();
  }

  function cover (ctx, img, x, y, width, height, opts) {
    opts = Object.assign({ cx: 0.5, cy: 0.5, zoom: 1, alpha: 1 }, opts || {});
    if (opts.cx < 0 || opts.cx > 1) throw new Error('Make sure 0 < opt.cx < 1 ');
    if (opts.cy < 0 || opts.cy > 1) throw new Error('Make sure 0 < opt.cy < 1 ');
    if (opts.zoom < 1) throw new Error('opts.zoom not >= 1');

    const ir = img.width / img.height;
    const r = width / height;
    // sw and sh are where we will start from in the image (we may be cropping it)
    const sw = (ir < r ? img.width : img.height * r) / opts.zoom;
    const sh = (ir < r ? img.width / r : img.height) / opts.zoom;
    // sx and sy are the width/height to crop out
    const sx = (img.width - sw) * opts.cx;
    const sy = (img.height - sh) * opts.cy;
    ctx.globalAlpha = opts.alpha;
    ctx.drawImage(img, sx, sy, sw, sh, x, y, width, height);
  }

  function insertPhotoIntoCanvas() {
    window.photoCanvas.width = window.innerWidth;
    window.photoCanvas.height = window.innerWidth;
    var context = window.photoCanvas.getContext('2d');
    window.photoCanvas.width = window.innerWidth;
    window.photoCanvas.height = window.innerWidth;
    var ratio = window.photoCanvas.width / 800;
    context.scale(ratio, ratio);
    context.drawImage(window.takenPhoto, 0, 0, window.takenPhoto.width, window.takenPhoto.height);
  }

  function loadSVGIntoCanvas(svg, canvas) {
    var context = canvas.getContext('2d');
    try {
      var image = new Image(800, 800);
      image.onload = function(e) {
      	context.drawImage(image, 0, 0, image.width, image.height);
      };
      var xml = new XMLSerializer();
      var url = xml.serializeToString(svg);
      image.src = "data:image/svg+xml," + encodeURIComponent(url);
    } catch(err) {
      console.error(err);
    }
  }

  function clearCanvas(canvas) {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function loadMyPhotos() {
    $('.home-screen .topbar').addClass('inactive');
    $('.content-topbar').removeClass('inactive');
    $('.screen.active').removeClass('active left right').addClass('exit left');
    $('.myPhotos').addClass('active left');
    closeMenu($('.hamburger.is-active')[0]);
    setTimeout(function() {
      $('.screen.exit').removeClass('exit left right');
    }, 400);
    $('.myPhotos').html('');
    localforage.getItem('photomaton').then(function(data) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].author == window.current_user.user_id)
          $('.myPhotos').append(`<div class="image-container" id="${data[i].id}" data-imageid="${data[i].better_featured_image.id}">
                                  <div class="shareOrDeleteZone">
                                    <button class="share"><i class="fa fa-share-alt" aria-hidden="true"></i></button>
                                    <button class="delete"><i class="fa fa-trash-o" aria-hidden="true"></i></button>
                                  </div>
                                  <a data-fancybox="myphotos" href="${data[i].better_featured_image.source_url}">
                                    <img src="${data[i].better_featured_image.source_url}"/>
                                  </a>
                                </div>`);
      }
      $('.myPhotos .image-container').each(function(idx, el) {
        var tmp = new Hammer(el);
        tmp.on('swipeleft', function(e) {
          var shareZone = $(el).find('.shareOrDeleteZone').addClass('show');
        });
        tmp.on('swiperight', function(e) {
          $(el).find('.shareOrDeleteZone').removeClass('show');
        });
      });
      $('.myPhotos .image-container .shareOrDeleteZone .share').click(function(e) {
        var container = $(this).parent().parent();
        var options = {
          message: 'Regarde la photo que j\'ai prise avec l\'application VosgesEmoi !',
          files: [container.find('a').attr('href')],
        }
        var onSuccess = function(result) {
          if (navigator.platform = "ios")
          navigator.notification.alert("Votre contenu a bien été partagé !", donothing, "Partage", "Merci !");
        }
        var onError = function(err) {
          navigator.notification.alert("Le partage de votre contenu a échoué !", donothing, "Partage", "D'accord");
        }
        window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
      });
      $('.myPhotos .image-container .shareOrDeleteZone .delete').click(function(e) {
        var container = $(this).parent().parent();
        var id = container.attr('id');
        var imageID = container.data('imageid');
        if (confirm("Voulez vous vraiment supprimer cette photo ?")) {
          Promise.all([deleteOnServer(API_URL + 'photomaton/' + id + "?force=true"),
          deleteOnServer(API_URL + 'media/' + imageID + "?force=true")]).then(function(deletedArray) {
            var deleted = true;
            $(deletedArray).each(function(idx, el) {
              if (!JSON.parse(el).deleted) {
                deleted = false;
              }
            });
            if (deleted) {
              navigator.notification.alert("Votre photo a bien été supprimée !", donothing, "Information", "Merci!");
              container.remove();
            } else {
              navigator.notification.alert("Une erreur s'est produite lors de la suppression de votre photo", donothing, "Erreur", "J'ai compris.");
            }
          }).catch(function(err) {
            if (err) {
              navigator.notification.alert("Une erreur s'est produite lors de la suppression de votre photo", donothing, "Erreur", "J'ai compris.");
            }
          });
        }
      });
    });
  }

  function sendPhotomaton(e) {
    e.preventDefault();
    try {
      var md5Hash = md5(new Date().toString());
      var title = md5Hash + "photomaton" + window.current_user.user_id;
      window.photoCanvas = document.createElement('canvas');
      var tmpContext = window.photoCanvas.getContext('2d');
      window.photoCanvas.width = 800;
      window.photoCanvas.height = 800;
      clearCanvas(window.photoCanvas);
      tmpContext.drawImage(window.takenPhoto, 0, 0, window.takenPhoto.width, window.takenPhoto.height);
      loadSVGIntoCanvas(window.loadedSVG, window.photoCanvas);
      $('.photoZone .loadbg').addClass('show');
      $.ajax({
        url: "http://www.vosgesemoi.fr/wp-json/wp/v2/photomaton?title=" + title + "&status=publish",
        method: 'POST',
        headers: {
          "Authorization": "Bearer " + window.current_user.token
        }
      }).then(function(data) {
        var lat;
        var lng;
        navigator.geolocation.getCurrentPosition(function(pos) {
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
          $.ajax({
            url: "http://www.vosgesemoi.fr/wp-json/vemapp/v2/photomaton",
            method: 'POST',
            headers: {
              "Authorization": "Bearer " + window.current_user.token
            },
            data: {
              id: data.id,
              file: window.photoCanvas.toDataURL("image/png"),
              title: "photomaton_" + window.current_user.user_id,
              lat: lat,
              lng: lng
            }
          }).then(function(data) {
            navigator.notification.alert("Votre image à bien été enregistrée !", donothing, "Information", "Merci !");
            $('.photoZone .loadbg').hide();
            $('.photoZone .modifyPhoto .modify-submenu').removeClass('selected');
            $('.photoZone').hide();
            loadAndStore('photomaton', '?per_page=99').then(function() {
              loadMyPhotos();
            });
          }).catch(function(err) {
            console.error("ERROR : " + JSON.stringify(err));
          });
        }).catch(function(err) {
          console.error("ERROR 2 : " + JSON.stringify(err));
        });
      }).catch(function(err) {
        console.error("ERROR 3 : " + JSON.stringify(err));
      });
    } catch(err) {
      console.error("ERROR 4 : " + JSON.stringify(err));
    }
  }

  function loadCamera() {
    var Camera = (typeof navigator.camera !== "undefined") ? navigator.camera : Camera;
    var opts = {
      quality: 100,
      destinationType: Camera.DestinationType.FILE_URI,
      encodingType: Camera.EncodingType.PNG,
      mediaType: Camera.MediaType.PICTURE,
      pictureSourceType: Camera.PictureSourceType.CAMERA,
      correctOrientation: true,
      allowEdit: true,
      targetWidth: 800,
      targetHeight: 800
    };
    window.appliedFilter = false;
    Camera.getPicture(function cameraSuccess(data) {
      try {
        $('footer').hide();
        $('.screen.active').removeClass('active');
        $('.photoZone').show();
        $('.photoZone .leavePhotoZone').click(function() {
          $('footer').show();
          $('.photoZone').hide();
        });
      } catch(err) {
        console.error(err);
      }
      window.photoCanvas = document.getElementsByTagName('canvas')[0];
      context = window.photoCanvas.getContext('2d');
      window.takenPhoto = new Image(800, 800);
      window.takenPhoto.addEventListener('load', function(e) {
        try {
          insertPhotoIntoCanvas();
          $('.photoZone .getFilters').click(function() {
            $('.photoZone .change-filter-color').removeClass('selected');
            $(this).find('button').each(function(idx, $el) {
              $($el).click(function(e) {
                e.preventDefault();
                var photoCanvas = document.getElementsByTagName('canvas')[0];
                if (window.appliedFilter) {
                  clearCanvas(photoCanvas);
                  insertPhotoIntoCanvas();
                }
                window.appliedFilter = true;
                var filterName = $(this).data('filter');
                get('img/filter-' + filterName + '.svg').then(function(data) {
                  window.loadedSVG = $(data)[0];
                  window.loadedSVG.width.baseVal = window.takenPhoto.width;
                  window.loadedSVG.height.baseVal = window.takenPhoto.height;
                  loadSVGIntoCanvas(window.loadedSVG, window.photoCanvas);
                  //window.photoCanvas.getContext('2d').drawImage(window.loadedSVG, 0, 0);
                }).catch(function(err) {
                  console.error(err);
                });
              });
            });
            $(this).addClass('selected');
          });
          $('.photoZone .change-filter-color').unbind('click');
          $('.photoZone .change-filter-color').click(function() {
            if (window.appliedFilter) {
              $('.photoZone .getFilters').removeClass('selected');
              $(this).find('button').each(function(idx, el) {
                $(el).click(function(e) {
                  clearCanvas(photoCanvas);
                  insertPhotoIntoCanvas();
                  var color = $(this).data('color');
                  $(window.loadedSVG).find('.cls-1').each(function(idx, el) {
                    $(el).css('fill', color);
                  })
                  loadSVGIntoCanvas(window.loadedSVG, window.photoCanvas);
                });
              });
              $(this).addClass('selected');
            } else {
              console.error("Veuillez d'abord séléctionner un filtre !");
            }
          });
          $('.photoZone .getFilters .filters').click();
          $('.photoZone .getFilters .filters .plain').click();
          $('.photoZone .saveAndSendPhoto').unbind('click');
          $('.photoZone .saveAndSendPhoto').click(sendPhotomaton);
        } catch(err) {
          console.error(err);
        }
      });
      takenPhoto.src = data;
    }, function cameraError(err) {
      console.error(err);
    }, opts);
  }

  function initCameraButton() {
    $('.home-screen .takePhoto').click(loadCamera);
    $('#menu .takePhoto').click(loadCamera);
    if ((typeof window.current_user !== "undefined") && (window.current_user != null)) {
      $('.home-screen .takePhoto').prop('disabled', false);
      $('.home-screen .takePhoto').removeClass('disabled');
      $('#menu .takePhoto').prop('disabled', false);
      $('#menu .takePhoto').removeClass('disabled');
    } else {
      $('.home-screen .takePhoto').prop('disabled', true);
      $('.home-screen .takePhoto').addClass('disabled');
      $('#menu .takePhoto').prop('disabled', true);
      $('#menu .takePhoto').addClass('disabled');
    }
    if (!navigator.onLine) {
      $('.home-screen .takePhoto').prop('disabled', true);
      $('.home-screen .takePhoto').addClass('disabled');
      $('#menu .takePhoto').prop('disabled', true);
      $('#menu .takePhoto').addClass('disabled');
    }
    $(window).on('offline', function() {
      $('.home-screen .takePhoto').prop('disabled', true);
      $('.home-screen .takePhoto').addClass('disabled');
      $('#menu .takePhoto').prop('disabled', true);
      $('#menu .takePhoto').addClass('disabled');
    });
    $(window).on('online', function() {
      if ((typeof window.current_user !== "undefined") && (window.current_user != null)) {
        $('.home-screen .takePhoto').prop('disabled', false);
        $('.home-screen .takePhoto').removeClass('disabled');
        $('#menu .takePhoto').prop('disabled', false);
        $('#menu .takePhoto').removeClass('disabled');
      }
    });
  }

  function openMenu(_this) {
    $(_this).addClass("is-active");
    $('.home-screen .takePhoto').hide();
    $('.home-screen .topbar, .content-topbar').addClass("vem");
    $('#menu').addClass('active');
    if (typeof window.current_user !== "undefined") {
      $('#menu .loggedin-username').show();
    }
    $('#menu').addClass('showItems');
  }

  function closeMenu(_this) {
    if ($('#menu .connect-area').hasClass("connecting")) {
      $('#menu .connect-area').removeClass('connecting')
    } else {
      $(_this).removeClass("is-active");
      $('#menu').removeClass('showItems');
      $('#menu').removeClass("active");
      if (typeof window.current_user !== "undefined") {
        $('#menu .loggedin-username').hide();
      }
      $('.home-screen .takePhoto').show();
      $('.home-screen .topbar, .content-topbar').removeClass("vem");
    }
  }

  function initMenu() {
    $('#menu #connect').click(connectUser);
    $('#menu .connect button').click(function(e) {
      $('.connect-area').addClass('connecting');
    });
    $('#menu .loadfavorites').click(showFavorites);
    $('#become_member').click(function(e) {
      e.preventDefault();
      $('#menu .register').addClass('registering');
      $('#menu .register .registerUser').click(registerUser);
    });
    $('#menu .register .hamburger.is-active').click(function(e) {
      $('#menu .register').removeClass('registering');
      $('#menu .register .registerUser').unbind('click');
    });
    $('.home-screen button.hamburger, .content-topbar button.hamburger').click(function (e) {
      if ($("#menu").hasClass("active")) {
        closeMenu(this);
      } else if ($("#menu").not("active") && $("menu").not("menu-exit")) {
        openMenu(this);
      }
    });
    if (typeof window.current_user !== "undefined") {
      $('#menu').removeClass('disconnected').addClass('connected');
    } else {
      $('#menu').removeClass('connected').addClass('disconnected');
    }
  }
  function initContentTopbar() {
    $('.content-topbar .returnHome').click(returnHome);
    $('.content-topbar .showFavorites').click(showFavorites);
  }
  function loggedInUserUI() {
    if ((typeof window.current_user !== "undefined") && (window.current_user != null)) {
      $('.home-screen .username, #menu .loggedin-username').html(window.current_user.user_nicename);
      $('#menu .loggedin-username').show();
      $('#menu .avatar').css('background-image', 'url(' + window.current_user.user_object.avatar_urls["96"] + ')');
      $('#menu .logout').removeClass('not-loggedin');
      $('#menu .logout').click(logOutUser);
      $('#menu .profil').click(function(e) {
        $('#menu .update').addClass('updating');
        $('#menu .update .hamburger.is-active').click(function(e) {
          $('#menu .update').removeClass('updating');
        });
        $('#menu .updateUser').click(updateUser);
      });
      $('#menu .gallery').click(loadMyPhotos);
      $('#menu .connect').hide();
      $('#menu').removeClass('disconnected').addClass('connected');
    }
  }

  function logOutUser(e) {
    if (typeof e !== "undefined") {
      if (typeof e.preventDefault !== "undefined")
        e.preventDefault();
    }
    $(this).unbind('click');
    $('#menu .gallery').unbind('click');
    $('#menu .profil').unbind('click');
    delete window.current_user;
    localforage.removeItem('currentUser').then(function() {
      navigator.notification.alert("Vous êtes maintenant déconnecté !", donothing, "Information", "Merci !");
    });
    localforage.removeItem('favorites').then(function() {
      console.log("favorites deleted");
    });
    $('.home-screen .username, #menu .loggedin-username').html("");
    $('#menu .loggedin-username').hide();
    $('#menu .connect').show();
    $('#menu .connect .connect-area').show();
    $('#menu .avatar').css('background-image', '');
    $('#menu .logout').addClass('not-loggedin');
    if (typeof window.current_user !== "undefined") {
      $('#menu').removeClass('disconnected').addClass('connected');
    } else {
      $('#menu').removeClass('connected').addClass('disconnected');
    }
  }

  function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  function updateUser(e) {
    if (typeof e.preventDefault !== "undefined")
      e.preventDefault();
    var update = true;
    var name = $('#menu .update .name');
    var fname = $('#menu .update .fname');
    var pass = $('#menu .update .pass');
    var pass2 = $('#menu .update .pass');
    if (name.val().length < 2) {
      navigator.notification.alert("Votre nom doit contenir au moins 2 lettres", donothing, "Important", "J'ai compris.");
      update = false;
    } else if (fname.val().length < 2) {
      navigator.notification.alert("Votre prénom doit contenir au moins 2 lettres", donothing, "Important", "J'ai compris.");
      update = false;
    } else if (pass.val().length < 8) {
      navigator.notification.alert("Votre mot de passe doit contenir au moins 8 caractères", donothing, "Important", "J'ai compris.");
      update = false;
    }
    if (pass.val() !== pass2.val()) {
      update = false;
    }
    if (update) {
      $.ajax({
        url: "http://www.vosgesemoi.fr/wp-json/vemapp/v2/update/user",
        method: 'POST',
        crossDomain: true,
        dataType: 'json',
        data: {
          user_id: window.current_user.user_id,
          name: name.val(),
          fname: fname.val(),
          password: pass.val()
        }
      }).then(function(data) {
        if (data) {
          navigator.notification.alert("Vos Informations ont bien été mises à jour, veuillez vous connecter à nouveau", donothing, "Information", "Merci !");
          $('#menu .update').removeClass('updating');
          logOutUser();
        }
      }).catch(function(err) {
        if (err) {
          navigator.notification.alert("Une erreur est survenue lors de la mise à jour de vos informations", donothing, "Information", "D'accord");
        }
      });
    }
  }

  function registerUser(e) {
    e.preventDefault();
    var uploading = true;
    var pseudo = $('#menu .register .pseudo');
    var name = $('#menu .register .name');
    var fname = $('#menu .register .fname');
    var mail = $('#menu .register .mail');
    var pass = $('#menu .register .pass');
    if (pseudo.val().length < 4) {
      navigator.notification.alert("Votre pseudo doit contenir au moins 4 lettres", donothing, "Important", "J'ai compris.");
      uploading = false;
    } else if (name.val().length < 2) {
      navigator.notification.alert("Votre nom doit contenir au moins 2 lettres", donothing, "Important", "J'ai compris.");
      uploading = false;
    } else if (fname.val().length < 2) {
      navigator.notification.alert("Votre prénom doit contenir au moins 2 lettres", donothing, "Important", "J'ai compris.");
      uploading = false;
    } else if (!(validateEmail(mail.val()))) {
      navigator.notification.alert("Votre mail doit être valide", donothing, "Important", "J'ai compris.");
      uploading = false;
    } else if (pass.val().length < 8) {
      navigator.notification.alert("Votre mot de passe doit contenir au moins 8 caractères", donothing, "Important", "J'ai compris.");
      uploading = false;
    }
    if (uploading) {
      $.ajax({
        url: "http://www.vosgesemoi.fr/wp-json/vemapp/v2/create/user",
        method: 'POST',
        crossDomain: true,
        dataType: 'json',
        data: {
          username: pseudo.val(),
          name: name.val(),
          fname: fname.val(),
          mail: mail.val(),
          password: pass.val()
        }
      }).then(function(data) {
        if (data) {
          navigator.notification.alert("Vous êtes bien inscrits, vous pouvez maintenant vous connecter depuis le menu", donothing, "Information", "Merci !");
        }
      }).catch(function(err) {
        if (err.responseJSON.errorData.errors) {
          if (typeof err.responseJSON.errorData.errors.existing_user_login !== "undefined") {
              navigator.notification.alert(err.responseJSON.errorData.errors.existing_user_login[0], donothing, "Erreur", "J'ai compris.");
          } else if (typeof err.responseJSON.errorData.errors.existing_user_email !== "undefined") {
              navigator.notification.alert(err.responseJSON.errorData.errors.existing_user_email[0], donothing, "Erreur", "J'ai compris.");
          }
        }
      });
    }
  }

  function connectUser() {
    $.ajax({
      url: "http://www.vosgesemoi.fr/wp-json/jwt-auth/v1/token",
      method: 'POST',
      crossDomain: true,
      dataType: 'json',
      data: {
        username: $('#username').val(),
        password: $('#pass').val()
      }
    }).then(function(data) {
      $('#menu .input-area .alert').hide();
      window.current_user = data;
      getJSON(API_URL + 'users/' + data.user_id).then(function(user_object) {
        data.user_object = user_object;
        localforage.setItem('currentUser', data).then(function() {
          $.ajax({
            url: "http://www.vosgesemoi.fr/wp-json/vemapp/v2/loadfavoris",
            method: 'POST',
            headers: {
              "Authorization": "Bearer " + window.current_user.token
            },
            data: {
              user_id: window.current_user.user_id
            }
          }).then(function(data) {
            if ((typeof data !== "undefined") && (data.return)) {
              localforage.setItem('favorites', data.meta).then(function() {
                getFavorites();
                initCameraButton();
                loggedInUserUI();
              });
            } else {
              initCameraButton();
              loggedInUserUI();
            }
          });
        });
      });
      $('#menu .connect-area').removeClass('connecting').hide();
    }).catch(function(err) {
      console.error(err);
      $('#menu .input-area .alert').show();
    });
  }

  function leaveFavorites() {
    $('.favorites').removeClass('active left right').addClass('exit left');
    $('.screen.prev').removeClass('prev').addClass('active left');
  }

  function showFavorites() {
    closeMenu($('.hamburger.is-active'));
    var commonDatasName = ['restaurants', 'hebergements', 'activites'];
    var favorites_data = {};
    Promise.all([localforage.getItem('restaurants'),
    localforage.getItem('hebergements'),
    localforage.getItem('activites')]).then(function(datas) {
      for (var i = 0; i < commonDatasName.length; i++) {
        favorites_data[commonDatasName[i]] = {};
        favorites_data[commonDatasName[i]].datas = [];
        for (var j = 0; j < datas[i].length; j++) {
          if (_.contains(favorites, datas[i][j].id.toString())) {
            favorites_data[commonDatasName[i]].datas.push(datas[i][j]);
          }
        }
      }
      //données filtrées
      $('.screen.active').removeClass('active left right').addClass('exit left');
      $('.home-screen .topbar').addClass('inactive');
      $('.content-topbar').removeClass('inactive');
      $('.favorites_zone').addClass('active left');
      $('.favorites_zone .fav_nav .filter').click(function(e) {
        $('.favorites_zone .showFilteredData').removeClass('showFilteredData');
        $(this).addClass('showFilteredData');
        $($(this).data('filter')).addClass('showFilteredData');
        $('.content-topbar .name').html("<h1>" + $('.favorites_zone .fav_nav .showFilteredData').html() + "</h1>");
      });
      loadTemplate('restaurants', restaurants_template).then(function(template) {
        $('.favorites_zone .restaurants_fav').html(Mustache.render(template, favorites_data['restaurants']));
        $('.favorites_zone .fav_nav .filter').eq(0).click();
        $('.favorites_zone .restaurants_fav .category .thumbnail').click(loadSingleTemplate);
        $('.favorites_zone .restaurants_fav .category .presentation').click(loadSingleTemplateFromTitle);
        $('.favorites_zone .restaurants_fav .category .phone').click(launchCall);
        $('.favorites_zone .restaurants_fav .category .marker').click(navigateToDest);
      });
      loadTemplate('hebergements', hebergements_template).then(function(template) {
        $('.favorites_zone .hebergements_fav').html(Mustache.render(template, favorites_data['hebergements']));
        $('.favorites_zone .hebergements_fav .category .thumbnail').click(loadSingleTemplate);
        $('.favorites_zone .hebergements_fav .category .presentation').click(loadSingleTemplateFromTitle);
        $('.favorites_zone .hebergements_fav .category .phone').click(launchCall);
        $('.favorites_zone .hebergements_fav .category .marker').click(navigateToDest);
      });
      loadTemplate('activites', activites_template).then(function(template) {
        $('.favorites_zone .activites_fav').html(Mustache.render(template, favorites_data['activites']));
        $('.favorites_zone .activites_fav .category .thumbnail').click(loadSingleTemplate);
        $('.favorites_zone .activites_fav .category .presentation').click(loadSingleTemplateFromTitle);
        $('.favorites_zone .activites_fav .category .phone').click(launchCall);
        $('.favorites_zone .activites_fav .category .marker').click(navigateToDest);
      });
      loadBG($('.favorites_zone'));
      setTimeout(function() {
        $('.screen.exit.left').removeClass('exit left right').addClass('prev');
      }, 400);
    });
  }

  function getFavorites() {
    if (!favorites.length) {
       localforage.getItem('favorites').then(function(data) {
         if ((typeof data !== "undefined") && (data.length)) {
           favorites = data;
           favorites.map(function(id) {
             $('#' + id).find('.fa-heart-o').removeClass('fa-heart-o').addClass('fa-heart');
           });
           $('.favNumber').html(favorites.length);
         } else {
           $('.favNumber').html(0);
         }
       }).catch(function(err) {
         console.log("no meta");
       });
    }
  }

  function addOrDeleteFavorites() {
    if ($(this).hasClass('fa-heart-o')) {
      $(this).removeClass('fa-heart-o').addClass('fa-heart');
      var fiche = $(this).parent();
      var id = fiche[0].id;
      if (!_.contains(favorites, id)) {
        favorites.push(id);
        localforage.setItem('favorites', favorites).then(function() {
          $('.favNumber').html(favorites.length);
        }).catch(function(err) {
          console.error("Une erreur est survenue lors de la sauvegarde des favoris !");
        });
        if (window.current_user) {
          $.ajax({
            url: "http://www.vosgesemoi.fr/wp-json/vemapp/v2/favoris",
            method: 'POST',
            headers: {
              "Authorization": "Bearer " + window.current_user.token
            },
            data: {
              fav_id: id,
              user_id: window.current_user.user_id
            }
          }).then(function(data) {
            if (data) {
              console.log("meta updated");
            }
          });
        }
      }
    } else {
      $(this).removeClass('fa-heart').addClass('fa-heart-o');
      var fiche = $(this).parent();
      var id = fiche.attr('id');
      if (typeof id === "undefined") {
        fiche = $(this).parent().parent();
        id = fiche.attr('id');
      }
      if (_.contains(favorites, id)) {
        favorites = _.filter(favorites, function(rowID) {
          return rowID != id;
        });
        if (favorites == null || favorites == "") {
          favorites = [];
        }
        if (window.current_user) {
          $.ajax({
            url: "http://www.vosgesemoi.fr/wp-json/vemapp/v2/delete/favoris",
            method: 'POST',
            headers: {
              "Authorization": "Bearer " + window.current_user.token
            },
            data: {
              fav_id: id,
              user_id: window.current_user.user_id
            }
          }).then(function(data) {
            if (data) {
              console.log("meta updated");
            }
          });
        }
        localforage.setItem('favorites', favorites).then(function() {
          $('.favNumber').html(favorites.length);
        }).catch(function(err) {
          console.error("Une erreur est survenue lors de la sauvegarde des favoris !");
        });
      }
    }
  }

  $(window).on('load', function(e) {
      StatusBar.styleDefault();
      init();
      initFooter();
      initContentTopbar();
      initMenu();
      var now = new Date();
      localforage.getItem('seenIntro').then(function(seenIntro) {
        if ((typeof seenIntro !== "undefined") && (seenIntro != null)) {
          if (seenIntro) {
            $('.intro-screen').remove();
          } else {
            $('.intro-screen').show();
            $('#intro-slick').slick({
          		dots: true,
          		arrows: false,
              infinite: false,
              speed: 300,
              fade: true
          	});
            $('#intro-slick .mail-register').click(function(e) {
              localforage.setItem('seenIntro', true).then(function() {
                $('.intro-screen').hide();
                $('.intro-screen').remove();
                setTimeout(function() {
                  $('.home-screen .topbar .hamburger').click();
                  $('#menu #become_member').click();
                }, 50);
              });
            });
            $('#intro-slick .discover').click(function(e) {
              localforage.setItem('seenIntro', true).then(function() {
                $('.intro-screen').hide();
                $('.intro-screen').remove();
              });
            });
          }
        } else {
          $('.intro-screen').show();
          $('#intro-slick').slick({
            dots: true,
            arrows: false,
            infinite: false,
            speed: 300,
            fade: true
          });
          $('#intro-slick .mail-register').click(function(e) {
            localforage.setItem('seenIntro', true).then(function() {
              $('.intro-screen').hide();
              $('.intro-screen').remove();
              setTimeout(function() {
                $('.home-screen .topbar .hamburger').click();
                $('#menu #become_member').click();
              }, 50)
            });
          });
          $('#intro-slick .discover').click(function(e) {
            localforage.setItem('seenIntro', true).then(function() {
              $('.intro-screen').hide();
              $('.intro-screen').remove();
            });
          });
        }
      });
      localforage.getItem('currentUser').then(function(user) {
        if ((typeof user !== "undefined") && (user != null)) {
          window.current_user = user;
          if (typeof window.current_user.user_object === "undefined") {
            getJSON(API_URL + 'users/' + window.current_user.user_id).then(function(data) {
              window.current_user.user_object = data;
              loggedInUserUI();
              localforage.setItem('currentUser', window.current_user).then(function() {
                console.log("user updated");
              });
            });
          } else {
            loggedInUserUI();
          }
        }
        initCameraButton();
      }).catch(function(err) {
        console.error(err);
      });
      localforage.getItem('lastLoadedDate').then(function(lastLoadedDate) {
        if ((typeof lastLoadedDate !== undefined) && (lastLoadedDate != null)) {
          var absDiff = Math.abs(now.getTime() - lastLoadedDate.getTime());
          var milliDiff = absDiff / (1000 * 3600 * 24);
          if (milliDiff >= 1) {
            loadAllContent();
          } else {
            justGetLocalContentWithExternalImages();
          }
        } else {
          loadAllContent();
        }
      }).catch(function(err) {
        console.error(err);
      });
  });
})( jQuery );
