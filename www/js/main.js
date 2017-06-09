(function($) {
  const API_URL = "http://dev-serveur.fr/vosgesemoi2017/wp-json/wp/v2/"
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
  var maps = [];

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

  function new_map( $el ) {
    // var
    var $markers = $el.find('.marker');


    // vars
    var args = {
      zoom		: 16,
      center		: new google.maps.LatLng(0, 0),
      mapTypeId	: google.maps.MapTypeId.ROADMAP
    };


    // create map
    var map = new google.maps.Map( $el[0], args);


    // add a markers reference
    map.markers = [];


    // add markers
    $markers.each(function(){

        add_marker( $(this), map );

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

  function add_marker( $marker, map ) {

    // var
    var latlng = new google.maps.LatLng( $marker.attr('data-lat'), $marker.attr('data-lng') );

    // create marker
    var marker = new google.maps.Marker({
      position	: latlng,
      map			: map,
      icon		: $marker.data('marker-icon')
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
                var rendered = Mustache.render(template, data);
                $.fancybox.open({
                  src: rendered,
                  type: 'inline'
                });
                $('.fancybox-slide .seeSingle').click(loadSingleTemplateFromFancybox);
              });
            } else {
              var rendered = Mustache.render(photomaton_map_template, data);
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
                var rendered = Mustache.render(template, data);
                $.fancybox.open({
                  src: rendered,
                  type: 'inline'
                });
                $('.fancybox-slide .seeSingle').click(loadSingleTemplateFromFancybox);
              });
            } else {
              var rendered = Mustache.render(common_map_template, data);
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
    AOS.init();
    FastClick.attach(document.body);
  }

  function get(url) {
    // Return a new promise.
    return new Promise(function(resolve, reject) {
      // Do the usual XHR stuff
      var req = new XMLHttpRequest();
      req.open('GET', url);

      req.onload = function() {
        // This is called even on 404 etc
        // so check the status
        if (req.status == 200) {
          // Resolve the promise with the response text
          resolve(req.response);
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

  function getJSON(url) {
    // Return a new promise.
    return new Promise(function(resolve, reject) {
      // Do the usual XHR stuff
      var req = new XMLHttpRequest();
      req.open('GET', url);

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
      removeOtherElementsClass('footer button', 'selected');
      showScreen($('.home-screen'));
    } catch(err) {
      console.error(err);
    }
  }

  function deleteSingle() {
    var singleDiv = $(this).parent().parent();
    $('.screen.active').removeClass('disappearFromLeft');
    singleDiv.addClass('disappearFromRight');
    $('.screen.active').addClass('appearFromLeft');
    setTimeout(function() {
      singleDiv.remove();
      $('.screen.active').show();
      $('footer').show();
    }, 250);
  }

  function scrollInSingle() {
    var target = $($(this).data('target'));
    $('.single_nav .onglet_actif').removeClass('onglet_actif');
    $(this).addClass('onglet_actif');
    $('html, body').animate({ scrollTop: target.offset().top - 80 }, 750);
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

  function showScreen(target) {
      console.log(target);
    try {
      if (target.length == 1) {
        if (target.not('.active')) {
          $('body').scrollTop(0);
          var activeElement = $('main .screen.active');
          if (activeElement.length == 1) {
            target.addClass('active');
            activeElement.removeClass('active').addClass('exit');
            setTimeout(function() {
              activeElement.removeClass('exit');
            }, 400);
            setTimeout(function() {
              maps.map(function(map) {
                google.maps.event.trigger(map, 'resize');
                center_map(map);
              });
            }, 50);
          } else {
            $('.home-screen').removeClass('active').addClass('exit');
            target.addClass('active');
            setTimeout(function() {
              activeElement.removeClass('exit');
            }, 400);
            setTimeout(function() {
              maps.map(function(map) {
                google.maps.event.trigger(map, 'resize');
                center_map(map);
              });
            }, 50);
          }
        }
      }
    } catch(err) {
      console.error(err);
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
      console.error(err);
    }
  }

  function changeContent(e) {
    try {
      var el = $(this);
      
      var target = el.data('target');
      var current_screen = $(".screen.active");
      
      current_screen.removeClass("active").addClass("exit");
      $(target).addClass("active");
      setTimeout(function() {
          current_screen.removeClass("exit")
      }, 700);
      
      if ($(target).not('.selected')) {
        removeOtherElementsClass('footer button', 'selected');
        el.addClass('selected');
        //showScreen(target);
        loadBG($(target));
      }
    } catch(err) {
      console.error(err);
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
    return new Promise(function(res, rej) {
      get(TEMPLATES_FOLDER + tName + '.mst').then(function(data) {
        if (typeof data !== "undefined") {
          tVar = data.toString();
          res(tVar);
        }
      }).catch(function(err) {
        rej(err);
      });
    });
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
                  console.log(ret);
                  if (ret.length) {
                    ret = ret.map(function(el) {
                      console.log(el);
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
          single_container.className = "single single_" + type;
          if (typeof single_template === "undefined") {
            loadTemplate('single', single_template).then(function(template) {
              $(single_container).html(Mustache.render(template, single));
              $('main').append(single_container);
              $('.single .relativePosts').append(single.posts);
              $('.single .relativePosts .post').click(openPost);
              //fixTop($('.single .single_name'));
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
              $('.screen.active').removeClass('appearFromRight')
              $('.screen.active').addClass('disappearFromLeft');
              setTimeout(function() {
                $('.single').addClass('appearFromRight');
              }, 10);
              setTimeout(function() {
                $('.screen.active').hide();
                $('.single .single_name').scrollToFixed({
                  dontSetWidth: true
                });
                $(window).resize();
                $(window).scroll();
              }, 600);
              $('.single .single_nav div').click(scrollInSingle);
              $('.single .gallery .seeMore').click(function() {
                $(this).parent().find('a')[0].click();
              });
              $('.single .topbar .leaveSingle').click(deleteSingle);
              $('.single .otherType .comeSee').click(loadSingleTemplateFromOtherType);
            }).catch(function(err) {
              console.error(err);
            });
          } else {
            $(single_container).html(Mustache.render(single_template, single));
            $('main').append(single_container);
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
            $('.screen.active').removeClass('appearFromRight')
            $('.screen.active').addClass('disappearFromLeft');
            setTimeout(function() {
              $('.single').addClass('appearFromRight');
            }, 10);
            setTimeout(function() {
              $('.screen.active').hide();
              $(window).resize();
              $(window).scroll();
            }, 600);
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
    $.fancybox.close();
    loadSingleTemplate.apply(this);
  }

  function loadSingleTemplateFromOtherType() {
    $('.leaveSingle').click();
    loadSingleTemplate.apply(this);

  }

  function loadCommonContent(tName, tVar) {
    loadTemplate(tName, tVar).then(function(template) {
      localforage.getItem(tName).then(function(data) {
        try {
          var tab = {
            datas : data
          }
          var content = document.createElement('div');
          content.className = "content";
          $(content).html(Mustache.render(template, tab));
          $('#' + tName).append(content);
          getGeolocation($('#' + tName + ' .' + tName + ' .distance'));
          $('.' + tName + '.category .thumbnail').click(loadSingleTemplate);
          $('#' + tName + ' .topbar .returnHome').click(returnHome);
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
      if (typeof single_post_template !== "undefined") {
        loadTemplate('single_post', single_post_template).then(function(template) {
          try {
            var container = document.createElement('div');
            $(container).html(Mustache.render(template, article));
            $(container).addClass('single_post');
            $(container).attr('id', article.id);
            $('main').append(container);
            $('.single_post .topbar .leavePost').click(deleteSingle);
            setTimeout(function() {
              $('.single_post').addClass('appearFromRight');
            }, 10);
          } catch(err) {
            console.error(err);
          }
        });
      } else {
        try {
          loadTemplate('single_post', single_post_template).then(function(template) {
            var container = document.createElement('div');
            $(container).html(Mustache.render(template, article));
            $(container).addClass('single_post');
            $(container).attr('id', article.id);
            $('main').append(container);
            $('.single_post .topbar .leavePost').click(deleteSingle);
            setTimeout(function() {
              $('.single_post').addClass('appearFromRight');
            }, 10);
          });
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
            $(content).html(Mustache.render(template, tmp));
            $('#agenda').append(content);
            setTimeout(function() {
              $('#agenda .content .post').click(openPost);
              $('#agenda .topbar .returnHome').click(returnHome);
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
          $(content).html(Mustache.render(posts_template, data));
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
                maps.push(new_map($('#carte .content .photos')));
                setTimeout(function() {
                  maps.map(function(map) {
                    google.maps.event.trigger(map, 'resize');
                    center_map(map);
                  });
                }, 50);
              });
            } else {
              $('#carte .content .photos').html(Mustache.render(markers_template, mustData));
              maps.push(new_map($('#carte .content .photos')));
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
            $('#carte .content .' + collectionName).html(Mustache.render(template, mustData));
            maps.push(new_map($('#carte .content .' + collectionName)));
            setTimeout(function() {
              maps.map(function(map) {
                google.maps.event.trigger(map, 'resize');
                center_map(map);
              });
            }, 50);
          });
        } else {
          $('#carte .content .' + collectionName).html(Mustache.render(markers_template, mustData));
          maps.push(new_map($('#carte .content .' + collectionName)));
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
    loadCommonContent('restaurants', restaurants_template);
    loadCommonContent('hebergements', hebergements_template);
    loadCommonContent('activites', activites_template);
    loadPosts();
    loadMaps();
  }

  function insertPhotoIntoCanvas() {
    var context = window.photoCanvas.getContext('2d');
    window.photoCanvas.width = window.innerWidth;
    window.photoCanvas.height = window.innerWidth / 0.75;
    if ((window.innerWidth / window.takenPhoto.width) < 1) {
      if (window.takenPhoto.height > window.takenPhoto.width) {
        context.scale((window.innerWidth / window.takenPhoto.width), ((window.innerWidth / 0.75) / 800));
      } else {
        context.scale(((window.innerWidth / 0.75) / 800), (window.innerWidth / window.takenPhoto.width));
      }
      context.drawImage(window.takenPhoto, 0, 0, window.takenPhoto.width, window.takenPhoto.height);
    }
  }

  function loadSVGIntoCanvas(svg, canvas) {
    var context = canvas.getContext('2d');
    try {
      var image = new Image(800, 600);
      image.onload = function(e) {
      	context.drawImage(image, 0, 0);
      };
      var xml = new XMLSerializer();
      var url = xml.serializeToString(svg)
      image.src = "data:image/svg+xml," + encodeURIComponent(url);
    } catch(err) {
      alert(err);
    }
  }

  function clearCanvas(canvas) {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function LoadCamera() {
    console.log(Camera);
    var Camera = (typeof navigator.camera !== "undefined") ? navigator.camera : Camera;
    var opts = {
      quality: 100,
      destinationType: Camera.DestinationType.FILE_URI,
      encodingType: Camera.EncodingType.PNG,
      mediaType: Camera.MediaType.PICTURE,
      pictureSourceType: Camera.PictureSourceType.CAMERA,
      correctOrientation: true,
    };
    window.appliedFilter = false;
    Camera.getPicture(function cameraSuccess(data) {
      try {
        $('footer').hide();
        //$('.screen.active').hide();
        $('.home-screen').hide();
        $('.photoZone').show();
        $('.photoZone .leavePhotoZone').click(function() {
          $('footer').show();
          $('.home-screen').show();
          $('.photoZone').hide();
        });
      } catch(err) {
        alert(err);
      }
      window.photoCanvas = document.getElementsByTagName('canvas')[0];
      context = window.photoCanvas.getContext('2d');
      var tmp = new Image();
      window.takenPhoto = new Image();
      takenPhoto.addEventListener('load', function(e) {
        tmp.remove();
        try {
          insertPhotoIntoCanvas();
          insertPhotoIntoCanvas();
          insertPhotoIntoCanvas();
          insertPhotoIntoCanvas();
          $('.photoZone .getFilters').click(function() {
            $('.photoZone .change-filter-color').removeClass('selected');
            $(this).find('button').each(function(idx, $el) {
              $($el).click(function() {
                var photoCanvas = document.getElementsByTagName('canvas')[0];
                if (window.appliedFilter) {
                  clearCanvas(photoCanvas);
                  insertPhotoIntoCanvas();
                  insertPhotoIntoCanvas();
                  insertPhotoIntoCanvas();
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
                  alert(err);
                });
              });
            });
            $(this).addClass('selected');
          });
          $('.photoZone .change-filter-color').click(function() {
            if (window.appliedFilter) {
              $('.photoZone .getFilters').removeClass('selected');
              $(this).find('button').each(function(idx, el) {
                $(el).click(function(e) {
                  clearCanvas(photoCanvas);
                  insertPhotoIntoCanvas();
                  insertPhotoIntoCanvas();
                  insertPhotoIntoCanvas();
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
              alert("Veuillez d'abord séléctionner un filtre =)");
            }
          });
        } catch(err) {
          alert(err);
        }
      });
      tmp.addEventListener('load', function() {
        if (tmp.width > tmp.height) {
          window.takenPhoto.wdth = 800;
          window.takenPhoto.height = 600;
        } else {
          window.takenPhoto.width = 600;
          window.takenPhoto.height = 800;
        }
        takenPhoto.src = data;
      });
      tmp.src = data;
    }, function cameraError(err) {
      console.error(err);
    }, opts);
  }

  function initCameraButton() {
    if (navigator.onLine) {
      $('.home-screen .takePhoto').click(LoadCamera);
    } else {
      $('.home-screen .takePhoto').prop('disabled', true);
    }
    $(window).on('offline', function() {
      $('.home-screen .takePhoto').prop('disabled', true);
    });
    $(window).on('online', function() {
      $('.home-screen .takePhoto').prop('disabled', false);
    });
  }

  function openMenu() {

  }

  function closeMenu() {

  }

  function initMenu() {
    $('button.hamburger').click(function (e) {
      if ($(this).hasClass('is-active')) {
        $(this).removeClass('is-active');
        closeMenu();
      } else {
        $(this).addClass('is-active');
        openMenu();
      }
    });
  }

  $(window).on('load', function() {
    initCameraButton();
  });

  $(document).ready(function(e) {
    init();
    initFooter();
    initMenu();
    var now = new Date();
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
