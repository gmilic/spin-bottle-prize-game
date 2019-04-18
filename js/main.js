var prevCoords, currCoords, pivotCoords;
var bottleVector, swipeVector;
var angle = 0;
var isSwiping = false;
var bottle;
var currentDeg = 0;
var foodChoice = false;
var tableList = [
  {start: 180, end: 209, name: '11'},
  {start: 210, end: 239, name: '12'},
  {start: 240, end: 269, name: '1'},
  {start: 270, end: 299, name: '2'},
  {start: 300, end: 329, name: '3'},
  {start: 330, end: 359, name: '4'},
  {start: 0, end: 29, name: '5'},
  {start: 30, end: 59, name: '6'},
  {start: 60, end: 89, name: '7'},
  {start: 90, end: 119, name: '8'},
  {start: 120, end: 149, name: '9'},
  {start: 150, end: 179, name: '10'}
];
var foodList = [
  {start: 180, end: 209, name: 'Točeno Sarajevsko Tamno 0.30 L + PILEĆI ŠTAPIĆI'},
  {start: 210, end: 239, name: 'Točeno Sarajevsko Nefiltrirano 0.30 L + PILEĆI ŠTAPIĆI'},
  {start: 240, end: 269, name: 'Točeno Sarajevsko svijetlo 0.30 L'},
  {start: 270, end: 299, name: 'Točeno Sarajevsko Tamno 0.30 L'},
  {start: 300, end: 329, name: 'Točeno Sarajevsko Nefiltrirano 0.30 L'},
  {start: 330, end: 359, name: 'Točeno Sarajevsko svijetlo 0.30 L + PILEĆI ŠTAPIĆI'},
  {start: 0, end: 29, name: 'Točeno Sarajevsko Tamno 0.30 L + PILEĆI ŠTAPIĆI'},
  {start: 30, end: 59, name: 'Točeno Sarajevsko Nefiltrirano 0.30 L + PILEĆI ŠTAPIĆI'},
  {start: 60, end: 89, name: 'Točeno Sarajevsko svijetlo 0.30 L'},
  {start: 90, end: 119, name: 'Točeno Sarajevsko Tamno 0.30 L'},
  {start: 120, end: 149, name: 'Točeno Sarajevsko Nefiltrirano 0.30 L'},
  {start: 150, end: 179, name: 'Točeno Sarajevsko svijetlo 0.30 L + PILEĆI ŠTAPIĆI'}
];
var choosenTable = '';
var choosenFood = '';

function init() {
  updatePivot();
  bottleVector = new Victor(200, 0); 
  render();
  startListening();
}

function startListening() {
  $(window).on('mousedown touchstart', function(e) {
    e.stopPropagation();
    e.preventDefault();
  
    isSwiping = true;
  
    prevCoords = getCoords(e);
    currCoords = getCoords(e);
  });
  
  $(window).on('mouseup touchend', function(e) {
    e.stopPropagation();
    e.preventDefault();
  
    isSwiping = false;

    // if spining stop catching input on bottle
    $(window).off(); //stop catching spining
  
    var torque = swipeVector.clone().cross(bottleVector);
    var angle = {
      prev: 0,
      target: torque * 0.075
    }
    
    // second parameter is how long will spin, default is 2
    TweenLite.from(angle, 3, {
      target: 0,
      onUpdate: function() {
        var step = angle.target - angle.prev;
        bottleVector.rotateDeg(step);
        angle.prev = angle.target;
      },
      onComplete: function() {
        // Do stuff when bottle stops spinning
        if (!foodChoice) {
          $(window).off(); //stop catching spining
          setTimeout(function(){
            $('.first-circle').css('z-index', '9');
            // $('.table-screen').css('display', 'flex');
            $('.table-screen').css('z-index', '999');
            $('.table-screen').addClass('animate-scale');
            // console.log(currentDeg);
            tableList.forEach(function(item) {
              if (item.start < item.end) {
                if (currentDeg >= item.start && currentDeg <= item.end) {choosenTable = item.name};
              } else {
                if (currentDeg >= item.start && currentDeg <= 359) {choosenTable = item.name};
                if (currentDeg >= 0 && currentDeg <= item.end) {choosenTable = item.name};
              }
            });
            $('#selected-table').text(choosenTable);
          }, 1000)
        } else {
          $(window).off(); //stop catching spining
          setTimeout(function(){
            $('.first-circle').css('z-index', '99');
            $('.food-screen').css('z-index', '999');
            $('.food-screen').addClass('animate-scale');
            // console.log(currentDeg);
            foodList.forEach(function(item) {
              if (item.start < item.end) {
                if (currentDeg >= item.start && currentDeg <= item.end) {choosenFood = item.name};
              } else {
                if (currentDeg >= item.start && currentDeg <= 359) {choosenFood = item.name};
                if (currentDeg >= 0 && currentDeg <= item.end) {choosenFood = item.name};
              }
            });
            $('#selected-food').text(choosenFood);
          }, 1000)
        }
  
      }
    })
  })
  
  $(window).on('mousemove touchmove', function(e) {
    e.stopPropagation();
    e.preventDefault();
  
    if (!isSwiping) return;

    currCoords = getCoords(e);
  
    var currVector = new Victor(currCoords.x, currCoords.y);
    var prevVector = new Victor(prevCoords.x, prevCoords.y);
    var pivotVector = new Victor(pivotCoords.x, pivotCoords.y);
    swipeVector = currVector.clone().subtract(prevVector);
  
    bottleVector = currVector.clone().subtract(pivotVector);
    bottleVector.norm().multiply(new Victor(200, 200)).invert();
  
    prevCoords = currCoords;
  })
  
  $(window).on('resize', function(e) {
    updatePivot();
  });
}

function render() {
  $('body .vector').remove();

  if (swipeVector) renderVector(swipeVector, prevCoords);
  if (bottleVector) {
    renderVector(bottleVector, pivotCoords);
    rotate('#bottle', bottleVector.angleDeg() + 180);
    
  }

  // rotate bottle
  requestAnimationFrame(render);
}

function getCoords(e) {
  var coords = {};

  switch (e.type) {
    case 'mouseup':
    case 'mousedown':
    case 'mousemove':
      coords.x = e.pageX;
      coords.y = e.pageY;
      break;
    case 'touchstart':
    case 'touchmove':
      coords.x = e.originalEvent.touches[0].pageX;
      coords.y = e.originalEvent.touches[0].pageY;
      break;
  }
  
  return coords;
}

function renderVector(v, translate) {

  var line = $('<div class="vector" />');

  line.css({
    left: translate.x,
    top: translate.y,
    height: v.length()
  });
  rotate(line, v.angleDeg());

  $('body').append(line);

  return line;
}

function rotate(el, deg) {
  var angle = deg + 90;
  
  $(el).css({
    '-ms-transform': 'rotate(' + (angle) + 'deg)',
    '-webkit-transform': 'rotate(' + (angle) + 'deg)',
    'transform': 'rotate(' + (angle) + 'deg)'
  });

  $('#pozicija').text(deg);
  currentDeg = Math.round(deg);
}

function updatePivot() {
  pivotCoords = {
    x: $(window).width() / 2,
    y: $(window).height() / 2
  };
  $('#pivot').css({
    left: pivotCoords.x,
    top: pivotCoords.y
  })
}

$('#start').on('click', function(){
  $('.start-screen').css('display', 'none');
  $('.start-screen').css('z-index', '0');
  $('.first-circle').css('display', 'inherit');
  $('.first-circle').css('z-index', '999');
  init();
});

$('#start-food').on('click', function(){
  foodChoice = true;
  $('.table-screen').css('display', 'none');
  $('.table-screen').css('z-index', '0');
  $('.first-circle').css('background-image', 'url(img/circle_02.png), url(img/bg.jpg)');
  $('.first-circle').css('display', 'inherit');
  $('.first-circle').css('z-index', '999');
  // $('.how-to-01').css('display', 'none');
  // $('.how-to-02').css('display', 'inherit');
  init();
});

$('#again').on('click', function(){
  location.reload();
})

// Manual spin
// $('#zavrti').on('click',function(){
//   var randomNum = Math.floor(Math.random() * 1000) + 2000;
  
//   var angle = {
//     prev: 0,
//     target: randomNum
//   }

//   TweenLite.from(angle, 10, {
//     target: 0,
//     onUpdate: function() {
//       var step = angle.target - angle.prev;
//       bottleVector.rotateDeg(step);
//       angle.prev = angle.target;
//     },
//     onComplete: function() {
//       // Do stuff when bottle stops spinning
//       if (!foodChoice) {
//         $(window).off(); //stop catching spining
//         setTimeout(function(){
//           $('.first-circle').css('z-index', '9');
//           // $('.table-screen').css('display', 'flex');
//           $('.table-screen').css('z-index', '999');
//           $('.table-screen').addClass('animate-scale');
//           // console.log(currentDeg);
//           tableList.forEach(function(item) {
//             if (item.start < item.end) {
//               if (currentDeg >= item.start && currentDeg <= item.end) {choosenTable = item.name};
//             } else {
//               if (currentDeg >= item.start && currentDeg <= 359) {choosenTable = item.name};
//               if (currentDeg >= 0 && currentDeg <= item.end) {choosenTable = item.name};
//             }
//           });
//           $('#selected-table').text(choosenTable);
//         }, 1000)
//       } else {
//         $(window).off(); //stop catching spining
//         setTimeout(function(){
//           $('.first-circle').css('z-index', '99');
//           $('.food-screen').css('z-index', '999');
//           $('.food-screen').addClass('animate-scale');
//           // console.log(currentDeg);
//           foodList.forEach(function(item) {
//             if (item.start < item.end) {
//               if (currentDeg >= item.start && currentDeg <= item.end) {choosenFood = item.name};
//             } else {
//               if (currentDeg >= item.start && currentDeg <= 359) {choosenFood = item.name};
//               if (currentDeg >= 0 && currentDeg <= item.end) {choosenFood = item.name};
//             }
//           });
//           $('#selected-food').text(choosenFood);
//         }, 1000)
//       }

//     }
//   })
// })

// init();