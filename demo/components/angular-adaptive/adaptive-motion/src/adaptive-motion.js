/**
 * angular-adaptive-motion v0.1.0
 * The MIT License
 * Copyright (c) 2013 Jan Antala
 */

(function () {

var adaptive = angular.module('adaptive.motion', []);

adaptive.provider('$motion', [function() {

  var video = document.getElementById('video');
  var canvas = document.getElementById('canvas');
  var _ = canvas.getContext('2d');
  var ccanvas = document.getElementById('comp');
  var c_= ccanvas.getContext('2d');

  var compression = 5;
  var width = 0;
  var height = 0;

  var draw;

  var start = function(){
    console.log('start');

    navigator.webkitGetUserMedia({audio:false,video:true},function(stream){
      var s = stream;
      video.src = window.webkitURL.createObjectURL(stream);
      video.addEventListener('play', function() {
        setInterval(dump, 1000/25);
      });
    },function(){
      console.log('OOOOOOOH! DEEEEENIED!');
    });
  };

  function dump() {
    if (canvas.width != video.videoWidth){
      width = Math.floor(video.videoWidth/compression);
      height = Math.floor(video.videoHeight/compression);
      canvas.width = ccanvas.width = width;
      canvas.height = ccanvas.height = height;
    }
    _.drawImage(video,width,0,-width,height);
    draw = _.getImageData(0,0,width,height);
    // c_.putImageData(draw,0,0);
    skinfilter();
    test();
  }

var huemin=0.0;
var huemax=0.10;
var satmin=0.0;
var satmax=1.0;
var valmin=0.4;
var valmax=1.0;

function skinfilter(){

  skin_filter=_.getImageData(0,0,width,height);
  var total_pixels=skin_filter.width*skin_filter.height;
  var index_value=total_pixels*4;

  var count_data_big_array=0;
  for (var y=0 ; y<height ; y++)
  {
    for (var x=0 ; x<width ; x++)
    {
      index_value = x+y*width
      var r = draw.data[count_data_big_array];
      var g = draw.data[count_data_big_array+1];
      var b = draw.data[count_data_big_array+2];
      var a = draw.data[count_data_big_array+3];

      hsv = rgb2Hsv(r,g,b);
      //When the hand is too lose (hsv[0] > 0.59 && hsv[0] < 1.0)
      //Skin Range on HSV values
      if(((hsv[0] > huemin && hsv[0] < huemax)||(hsv[0] > 0.59 && hsv[0] < 1.0))&&(hsv[1] > satmin && hsv[1] < satmax)&&(hsv[2] > valmin && hsv[2] < valmax)){
        skin_filter[count_data_big_array]=r;
        skin_filter[count_data_big_array+1]=g;
        skin_filter[count_data_big_array+2]=b;
        skin_filter[count_data_big_array+3]=a;
      }
      else{
        skin_filter.data[count_data_big_array]=0;
        skin_filter.data[count_data_big_array+1]=0;
        skin_filter.data[count_data_big_array+2]=0;
        skin_filter.data[count_data_big_array+3]=0;
      }

      count_data_big_array=index_value*4;
    }
  }
  draw=skin_filter;
  // c_.putImageData(draw,0,0);
}

function rgb2Hsv(r, g, b){

  r = r/255;
  g = g/255;
  b = b/255;

  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);

  var h, s, v = max;

  var d = max - min;

  s = max === 0 ? 0 : d / max;

  if(max == min){
      h = 0; // achromatic
  }
  else{
    switch(max){
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h, s, v];
}

var last = false;
var thresh = 150;
var down = false;
var wasdown = false;

function test(){
  var delt = _.createImageData(width,height);
  var totalx=0,totaly=0,totald=0,totaln=delt.width*delt.height,dscl=0,pix=totaln*4;

  if(last !== false){

    while(pix-=4){
      var d=Math.abs(
        draw.data[pix]-last.data[pix]
      )+Math.abs(
        draw.data[pix+1]-last.data[pix+1]
      )+Math.abs(
        draw.data[pix+2]-last.data[pix+2]
      );

      if(d>thresh){
        delt.data[pix]=160;
        delt.data[pix+1]=255;
        delt.data[pix+2]=255;
        delt.data[pix+3]=255;
        totald+=1;
        totalx+=((pix/4)%width);
        totaly+=(Math.floor((pix/4)/delt.height));
      }
      else{
        delt.data[pix]=0;
        delt.data[pix+1]=0;
        delt.data[pix+2]=0;
        delt.data[pix+3]=0;
      }
    }
  }

  if (totald){
    down={
      x: totalx/totald,
      y: totaly/totald,
      d: totald
    };
    // handledown()
  }
  // console.log(totald)
  last=draw;
  c_.putImageData(delt,0,0);
}


  this.$get = function() {
    return {
      start: function(){
        start();
      }
    };
  };
}]);

})();