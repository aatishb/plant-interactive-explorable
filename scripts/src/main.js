$(document).ready(function() {

  /***** scrollmagic *****/
  var controller = new ScrollMagic.Controller();
  // pin text
  $('.layer--content__text p, .js-content-pinnable').each(function(i, d) {
    new ScrollMagic.Scene({
      triggerElement: d,
      duration: i == 0 ? '35%' : '70%'
    })
    .setPin(d)
    .addTo(controller);
  });
  // pin overlays
  $('.layer--overlay').each(function(i, d) {
    new ScrollMagic.Scene({
      triggerElement: d,
      triggerHook: 'onLeave'
    })
    .setPin(d)
    .addTo(controller);
  });
  // trigger scene changes
  $('.js-scene-trigger').each(function(i, d) {
    new ScrollMagic.Scene({
      triggerElement: d,
      triggerHook: 'onLeave'
    })
    .setClassToggle(d, 'active')
    .on('enter leave', function() {
      var elem = $('.js-scene-trigger.active').last().get(0) || $('.js-scene-trigger').first().get(0);
      var idx = $(elem).data('index');
      $('.js-layer').removeClass('active');
      $('.js-layer--' + idx).addClass('active');
    })
    .addTo(controller);
  });


  /***** vine things *****/
  var container = $(".vine-container").get(0);
  var vineStates = {};
  var vine = {};
  var tweenState = {};
  var initialized = {};

  // setup renderer
  var renderer = PIXI.autoDetectRenderer(
    $(container).width() || 800,
    $(container).height() || 600,
    { transparent: true });

  $(container).append(renderer.view);

  function initializeVine(sceneID){

    if(initialized[sceneID]) return;

    vine[sceneID] = new VineScene({
      renderer: renderer,
      container: container,
      pointCount: 200
    });

    vineStates[sceneID] = [];
    $('.vine-path-scene'+sceneID).each(function(i, elem) {
      var path = Snap(elem);
      var pathLength = Snap.path.getTotalLength(path);

      vineStates[sceneID].push({
        path: path,
        pathLength: pathLength,
      });

      vine[sceneID].addVine();
    });

    initialized[sceneID] = true;
    tweenState[sceneID] = { time: 0 };
  }

  var durationValue = 0;
  function getDuration () {
    return durationValue;
  }
  function updateDuration () {
    durationValue = $('.js-vine-trigger').closest('animate').height();
  }

  $('.js-vine-trigger').each(function(i, d) {

    var scene_id = $(d).data('scene');
    var scene_duration = $(d).data('time');

    initializeVine(scene_id);

    new ScrollMagic.Scene({
        triggerElement: d,
        triggerHook: 'onEnter',
        duration: getDuration
      })
      .setTween(tweenState[scene_id], {time: scene_duration})
      .on('enter', function() {
        $(container).addClass('active')
        updateDuration();
      })
      .on('progress', function(){
        onUpdate(scene_id);
      })
      /*.setClassToggle(container, 'active')*/
      .addTo(controller);
 });


  // this kills the vine, while retaining reverse behavior
  // so if you scroll up, it shows you the previous vine scene
  $('.js-vine-kill').each(function(i, d) {

    new ScrollMagic.Scene({
        triggerElement: d,
        triggerHook: 'onCenter',
        duration: 0.1
      })
      .on('enter', function() {
        $(container).toggleClass('active');
      })
      .addTo(controller);
  });

  function onUpdate(sceneID) {
    if (!$(container).hasClass('active')) return;

    for (var i = 0; i < vineStates[sceneID].length; i++) {
      var state = vineStates[sceneID][i];
      vine[sceneID].updatePoints(i, function(points) {
        for (var i = 0; i < vine[sceneID].pointCount; i++) {
          var pos = (i / vine[sceneID].pointCount) * state.pathLength * tweenState[sceneID].time ;
          if (pos < state.pathLength) {
            var point = state.path.getPointAtLength(pos);
            points[i].x = point.x/0.5;
            points[i].y = point.y/0.5;
          }
        }
      });
    }

    vine[sceneID].render();
  }


});
