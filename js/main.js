var JSGifMaker = {
  init: function() {
    var that = this;
    this.fileApiSupportCheck();
    $(".select-images input").change(_.bind(this.imagesSelectedHandler, this));
    $(".controls input[type=range]").change(function() {
      $(this).prev().find(".value").text(this.value);
    });
    $(".controls .fps").change(function() {
      if(typeof that.previewInterval != "undefined") {
        that.setRefreshInterval(this.value);
      }
    });
  },

  canvases: [],

  imagesSelectedHandler: function(e) {
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

  fileApiSupportCheck: function() {
    if(!(window.File && window.FileReader && window.FileList && window.Blob)) {
      $(".alert.fileapinotsupported").show();
    }
  }
};
JSGifMaker.init();
