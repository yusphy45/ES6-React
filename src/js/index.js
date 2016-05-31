require('css/index.css');
let context = new AudioContext();
let source = null;
let audioBuffer = null;
let analyser = null;

const stopSound = () => {
  if (source) {
    source.stop(); //立即停止
  }
};

const createXHR = () => {
  if (typeof XMLHttpRequest !== undefined) {
    return new XMLHttpRequest();
  } else {
    return new ActiveXObject();
  }
};

const getData = (url) => {
  var xhr = createXHR();
  xhr.responseType = 'blob';
  xhr.open('get', url, true);
  xhr.send();
  return new Promise(function (resolve, reject) {
    xhr.onreadystatechange = function () {
      try {
        if (xhr.readyState == 4) {
          var result = xhr.response;
          if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
            resolve(result);
          } else {
            reject(result);
          }
        }
      } catch (ex) {
        console.log(ex);
        reject(ex);
      }
    };
  });
};

const playSound = () => {
  source = context.createBufferSource();
  analyser = context.createAnalyser();
  source.buffer = audioBuffer;
  source.loop = true;
  source.connect(analyser);
  analyser.connect(context.destination);
  source.start(); //立即播放
  drawSpectrum(analyser);
};

const initSound = (arrayBuffer) => {
  context.decodeAudioData(arrayBuffer, function (buffer) { //解码成功时的回调函数
    audioBuffer = buffer;
    playSound();
  }, function (e) { //解码出错时的回调函数
    console.log('Error decoding file', e);
  });
};

const ss = (element) => {
  var o;
  if (typeof element === 'object') {
    o = element;
  } else {
    o = document.querySelector(element);
  }
  o.bind = function (type, func) {
    document.addEventListener.call(o, type, function (e) {
      e.stopPropagation();
      e.preventDefault();
      func(e);
    }, false);
    return o;
  };
  return o;
};

const drawSpectrum = (analyser) => {
  var pageWidth = window.innerWidth;
  var canvas = document.getElementById('canvas'),
    cwidth = canvas.width,
    cheight = canvas.height / 2 - 2,
    meterWidth = 10, //频谱条宽度
    gap = 2, //频谱条间距
    capHeight = 2,
    capStyle = '#fff',
    meterNum = pageWidth / (meterWidth + gap), //频谱条数量
    capYPositionArray = []; //将上一画面各帽头的位置保存到这个数组
  var ctx = canvas.getContext('2d');
  var gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0.8, '#00f');
  gradient.addColorStop(0.5, '#0ff');
  gradient.addColorStop(0.8, '#00f');
  var drawMeter = function () {
    var array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    var step = Math.round(array.length / meterNum); //计算采样步长
    ctx.clearRect(0, 0, pageWidth, canvas.height);
    for (var i = 0; i < meterNum; i++) {
      var value = array[i * step] / 2; //获取当前能量值
      if (capYPositionArray.length < Math.round(meterNum)) {
        capYPositionArray.push(value); //初始化保存帽头位置的数组，将第一个画面的数据压入其中
      }
      ctx.fillStyle = capStyle;
      //开始绘制帽头
      if (value < capYPositionArray[i]) { //如果当前值小于之前值
        ctx.fillRect(i * 12, cheight - (--capYPositionArray[i]), meterWidth, capHeight); //则使用前一次保存的值来绘制帽头
      } else {
        ctx.fillRect(i * 12, cheight - value, meterWidth, capHeight); //否则使用当前值直接绘制
        capYPositionArray[i] = value;
      }
      //开始绘制频谱条
      ctx.fillStyle = gradient;
      ctx.fillRect(i * (meterWidth + gap), cheight + 1 - value, meterWidth, value);
      ctx.fillRect(i * (meterWidth + gap), canvas.height / 2 + 1, meterWidth, value);
    }
    requestAnimationFrame(drawMeter);
  };
  requestAnimationFrame(drawMeter);
};

ss(document).bind('dragenter', function () {
  return false;
}).bind('dragover', function () {
  return false;
}).bind('drop', function (e) {
  var file = e.dataTransfer.files[0];
  console.log(file);
  var reader = new FileReader();
  reader.onload = function (oFREvent) {
    stopSound();
    initSound(oFREvent.target.result);
  };
  reader.readAsArrayBuffer(file);
});

document.addEventListener('DOMContentLoaded', function () {
  var pageWidth = window.innerWidth;
  var canvas = document.getElementById('canvas');
  canvas.width = pageWidth;
  getData('/dist/media/My_Everything.mp3').then(function (res) {
    var reader = new FileReader();
    reader.onload = function (oFREvent) {
      stopSound();
      initSound(oFREvent.target.result);
    };
    reader.readAsArrayBuffer(res);
  }).catch(function (e) {
    console.log(e)
  });
}, false);



