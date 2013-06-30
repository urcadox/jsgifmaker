var JSGifMaker = {
  init: function() {
    this.fileApiSupportCheck();
  },

  fileApiSupportCheck: function() {
    if(!(window.File && window.FileReader && window.FileList && window.Blob)) {
      $(".alert.fileapinotsupported").show();
    }
  }
};
JSGifMaker.init();
