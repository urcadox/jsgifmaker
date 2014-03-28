var JSGifMaker = {
  init: function() {
    var that = this;
    this.fileApiSupportCheck();
    $(".select-images input[type=file]").change(_.bind(this.imagesSelectedHandler, this));
    $(".select-video input[type=file]").change(_.bind(this.videoSelectedHandler, this));
    $(".controls .generate").click(_.bind(this.generate, this));
    $(".controls input[type=range], .select-video input[type=range]").change(function() {
      $(this).prev().find(".value").text(this.value);
    });
    $(".controls .fps").change(function() {
      if(typeof that.previewInterval != "undefined") {
        that.setRefreshInterval(this.value);
      }
    });
    $(".select-video input[type=range]").change(function() {
      that.videoFPS = this.value;
    });
    $(".select-video .extract-frames").click(_.bind(this.startExtractingFrames, this));
  },

  canvases: [],

  imagesSelectedHandler: function(e) {
    $(".select-video").css("opacity", 0.3).find("input").attr("disabled", "disabled");
    var list = e.target.files, that = this;
    for(var i = 0; i < list.length; i++) {
      var img = new Image();
      temp = img;
      img.name = list[i].name;
      img.onload = function() {
        var canvas = $(document.createElement("canvas"))[0];
        $(canvas).data("img-name", this.name);
        canvas.width = this.width;
        canvas.height = this.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);
        that.canvases.push(canvas);
        if(that.canvases.length == list.length) {
          _.bind(that.imagesLoadedHandler, that)();
        }
      }
      img.src = URL.createObjectURL(list[i]);
    }
  },

  imagesLoadedHandler: function() {
    var that = this,
        div = $(".preview");
    this.previewIndex = 0;
    this.canvases = _.sortBy(this.canvases, function(c) { return $(c).data("img-name"); });
    div.width(this.canvases[0].width);
    div.height(this.canvases[0].height);
    this.canvases.forEach(function(c) {
      div.append(c);
    });
    this.setRefreshInterval(parseInt($(".controls .fps").val()));
  },

  videoSelectedHandler: function(e) {
    $(".select-images").css("opacity", 0.3).find("input").attr("disabled", "disabled");
    var file = e.target.files[0], that = this;
    if(typeof file != "undefined") {
      this.video = document.createElement("video");
      this.video.src = URL.createObjectURL(file);
      this.videoFPS = $(".select-video input[type=range]").val();
      $(".select-video .parameters").show();
      $(this.video).appendTo($(".preview"));
    }
  },

  setRefreshInterval: function(fps) {
    if(typeof this.previewInterval != "undefined") {
      clearInterval(this.previewInterval);
    }
    this.previewInterval = setInterval(
      _.bind(this.refreshPreview, this),
      1000 / fps
    );
  },

  refreshPreview: function() {
    var prev = this.previewIndex % this.canvases.length;
    var current = ++this.previewIndex % this.canvases.length;
    this.canvases[prev].style.visibility = "hidden";
    this.canvases[current].style.visibility = "visible";
  },

  stopPreview: function() {
    clearInterval(this.previewInterval);
  },

  startExtractingFrames: function() {
    this.canvases = [];
    this.video.onseeked = _.bind(this.extractFrame, this);
    _.bind(this.extractFrame, this)();
  },

  extractFrame: function() {
    var last = _.last(this.canvases);
    var current = document.createElement("canvas");
    current.width = this.video.videoWidth;
    current.height = this.video.videoHeight;
    current.getContext("2d").drawImage(this.video, 0, 0, current.width, current.height);
    if(typeof last == "undefined" || !this.equalCanvases(last, current)) {
      this.canvases.push(current);
    }
    if(this.video.ended) {
      this.imagesLoadedHandler();
    } else {
      this.videoNextFrame();
    }
  },

  videoNextFrame: function() {
    this.video.currentTime += 1 / this.videoFPS;
  },

  equalCanvases: function(c1, c2) {
    var data1 = c1.getContext("2d").getImageData(0, 0, c1.width, c1.height).data;
    var data2 = c2.getContext("2d").getImageData(0, 0, c2.width, c2.height).data;

    var i = 0;
    var equal = true;
    while(i <= data1.length && equal) {
      equal = data1[i] == data2[i];
      i++;
    }
    return equal;
  },

  fileApiSupportCheck: function() {
    if(!(window.File && window.FileReader && window.FileList && window.Blob)) {
      $(".alert.fileapinotsupported").show();
    }
  },

  generate: function() {
    this.stopPreview();

    var gif = new GIF({
      workers: 4,
      quality: parseInt($(".controls .quality").val()),
      workerScript: "js/gif.worker.js"
    });

    this.canvases.forEach(function(c) {
      gif.addFrame(c, { delay: Math.round(1000/parseInt($(".controls .fps").val())) });
    });

    gif.on("finished", function(blob) {
      var img = $(document.createElement("img"));
      img.attr("src", URL.createObjectURL(blob));

      $(".rendered").empty();
      img.appendTo($(".rendered"));
      $(".progress").hide();
      $(".progress .bar").width("0%");
    });

    gif.on("progress", function(x) {
      $(".progress .bar").width(x * 100 + "%");
    });

    $(".progress").show();
    gif.render();
  }
};
JSGifMaker.init();
