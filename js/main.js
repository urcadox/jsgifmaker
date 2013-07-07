var JSGifMaker = {
  init: function() {
    this.fileApiSupportCheck();
    $(".select-images input").change(_.bind(this.imagesSelectedHandler, this));
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
        div = $(".gif"),
        i = 0;
    this.canvases = _.sortBy(this.canvases, function(c) { return $(c).data("img-name"); });
    this.canvases.forEach(function(c) {
      div.append(c);
    });
    setInterval(function() {
      var prev = i % that.canvases.length;
      var current = ++i % that.canvases.length;
      that.canvases[prev].style.visibility = "hidden";
      that.canvases[current].style.visibility = "visible";
    }, 50);
  },

  fileApiSupportCheck: function() {
    if(!(window.File && window.FileReader && window.FileList && window.Blob)) {
      $(".alert.fileapinotsupported").show();
    }
  }
};
JSGifMaker.init();
