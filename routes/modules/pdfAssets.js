const fonts = {
  Roboto: {
    normal: 'assets/fonts/roboto/Roboto-Regular.ttf',
    bold: 'assets/fonts/roboto/Roboto-Medium.ttf',
    italics: 'assets/fonts/roboto/Roboto-Italic.ttf',
    bolditalics: 'assets/fonts/roboto/Roboto-MediumItalic.ttf',
  },
  Centaur: {
    normal: 'assets/fonts/CENTAUR.ttf',
  },
  THSarabunNew: {
    normal: 'assets/fonts/THSarabunNew/THSarabunNew.ttf',
    bold: 'assets/fonts/THSarabunNew/THSarabunNew-Bold.ttf',
    italics: 'assets/fonts/THSarabunNew/THSarabunNew-Italic.ttf',
    bolditalics: 'assets/fonts/THSarabunNew/THSarabunNew-BoldItalic.ttf',
  },
  Tahoma: {
    normal: 'assets/fonts/tahoma/tahoma.ttf',
    bold: 'assets/fonts/tahoma/tahoma-bd.ttf',
    italics: 'assets/fonts/tahoma/tahoma-it.ttf',
    bolditalics: 'assets/fonts/tahoma/tahoma-bfi.ttf',
  },
};

const customLayouts = {
  priceLayout: {
    hLineWidth: function (i, node) {
      if (i < node.table.body.length - 2) {
        return 0;
      }
      return i === node.table.body.length ? 2 : 1;
    },
    vLineWidth: function (i) {
      return 0;
    },
    hLineColor: function (i) {
      return '#808080';
    },
    paddingLeft: function (i) {
      return 0;
    },
    paddingRight: function (i) {
      return 0;
    },
    paddingTop: function (i) {
      return 1;
    },
    paddingBottom: function (i) {
      return 1;
    },
  },
  itemLayout: {
    hLineWidth: function (i, node) {
      if (i <= node.table.headerRows || i === node.table.body.length) {
        return 1;
      }
      return 0;
    },
    vLineWidth: function (i) {
      return 1;
    },
    hLineColor: function (i) {
      return '#000';
    },
    paddingLeft: function (i) {
      return 1;
    },
    paddingTop: function (i) {
      return 1;
    },
    paddingBottom: function (i) {
      return 1;
    },
  },
};

module.exports = { fonts, customLayouts };
