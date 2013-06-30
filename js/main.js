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
      img.name = list[i].name;
      img.onload = function() {
        var canvas = $(document.createElement("canvas"))[0];
        $(canvas).data("img-name", this.name);
        var ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);
        that.canvases.push(canvas);
        if(that.canvases.length == list.length) {
          that.imagesLoadedHandler();
        }
      }
      img.src = URL.createObjectURL(list[i]);
    }
  },

  imagesLoadedHandler: function() {
    console.log("images loaded!");
  },

  fileApiSupportCheck: function() {
    if(!(window.File && window.FileReader && window.FileList && window.Blob)) {
      $(".alert.fileapinotsupported").show();
    }
  }
};
JSGifMaker.init();
