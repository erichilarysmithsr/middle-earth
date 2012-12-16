window.lotr = window.lotr || {}
window.lotr = {
  // baseMap: 'http://www.elfenomeno.com/gme/getI.php?x={x}&y={y}&z={z}&m=3EN',
  //baseMap: 'http://localhost:8000/guerra/{z}/{x}/{y}.jpg',
  baseMap: 'http://listify.es/var/arda.big/{z}/{x}/{y}.jpg',
  baseLayer: 'http://xabel.cartodb.com/api/v1/viz/13827/viz.json',
  baseLayerGeo: 'http://xabel.cartodb.com/api/v1/viz/15029/viz.json',
  narrationUrl: 'http://xabel.cartodb.com/api/v1/sql?q=select%20*%20from%20lotr_narration',
  round: 1,
  step: 5,
  stepMovie: 1,
  showingOptions: false,
  showingGeo: false,
  synchedMovie: false,
  maxRound: 366,
  interval: 2500,
  intervalMovie: 30000,
  init: function(){
    this.viewRef = {
      drawer: $('#options'),
      drawerHandle: $('#handle'),
      geo: $('#geopolitical'),
      timeline: $('#timeline'),
      movie: $('#movieSynch')
    }
    this.initBaseMap();
    this.initLayers();
    this.initTimeline();
    this.bindActions();
    this.toggleOptions();
  },
  initTimeline: function() {
    this.viewRef.timeline.on('slidestop', this.goToTimePoint.bind(this))
    this.viewRef.timeline.slider();
    $('.timeLegend .origin').html(this.getDate(1, true));
    $('.timeLegend .end').html(this.getDate(this.maxRound, true));

  },
  initBaseMap: function() {
    var self = this;
    this.map = new L.Map('middleEarth', {
      center: [-55,-98],
      zoom: 4,
      maxZoom:8,
      minZoon:4,
      fadeAnimation: false,

    });
    this.map.setZoom(4);
    L.tileLayer(self.baseMap, {
      attribution: ''
    }).addTo(self.map);
  },
  initLayers: function() {
    this.drawCurrentLayer();
  },
  bindActions: function() {
    document.getElementById('nextRound').addEventListener('click', this.nextRound.bind(this));
    document.getElementById('prevRound').addEventListener('click', this.prevRound.bind(this));
    document.getElementById('autoPlay').addEventListener('click', this.autoPlay.bind(this));
    document.getElementById('stop').addEventListener('click', this.stop.bind(this));
    this.viewRef.drawerHandle.on('click', this.toggleOptions.bind(this));
    this.viewRef.geo.on('click', this.toggleGeo.bind(this));
    this.viewRef.movie.on('click', this.toggleMovie.bind(this));
  },
  goToTimePoint: function(ev) {
    var position = this.viewRef.timeline.slider('value');
    var nextRound = Math.floor(this.maxRound * position / 100)
    this.round = nextRound
    this.nextRound();
  },
  drawGeoLayer: function() {
    var self = this;
    if(!this.showingGeo) {
      this.showingGeo = true;
      cartodb.createLayer(self.map,
        self.baseLayerGeo
      ).on('done', function(layer) {
          self.map.addLayer(layer);
          self.geoLayer = layer;
      })
    }
  },
  removeGeoLayer: function() {
    if(this.showingGeo) {
      this.showingGeo = false;
      this.geoLayer.remove();
      this.geoLayer = null;
    }
  },
  drawCurrentLayer: function() {
    var self = this;
    cartodb.createLayer(self.map,
      self.getCurrentLayer(),
      {
        query: 'select * from lotr where round = ' + self.round,
        infowindow: self.infowindow
      }
    ).on('done', function(layer) {
      self.map.addLayer(layer);
      if(self.currentLayer) {
        self.currentLayer.remove();
      }
      self.currentLayer = layer;
      self.updateSlider();
      document.getElementById('date').innerHTML = self.getDate(self.round);
    });
  },
  updateSlider: function() {
    var percentage = 100 * this.round / this.maxRound
    this.viewRef.timeline.slider('value', percentage);
  },
  getCurrentLayer: function() {
    var link = this.baseLayer;
    return link;
  },
  nextRound: function() {
    var prevRound = this.round;
    var step = this.step;
    if(this.synchedMovie) { step = this.stepMovie }
    this.round = this.round + step;
    if(this.round <= this.maxRound) {
      this.drawCurrentLayer();
    } else {
      this.stop();
    }
    this.updateNarration(this.round, this.round - prevRound);
  },
  prevRound: function() {
    var prevRound = this.round;
    var step = this.step;
    if(this.synchedMovie) { step = this.stepMovie }
    this.round = this.round - step;
    if(this.round > 0) {
      this.drawCurrentLayer();
    } else {
      this.stop();
    }
    this.updateNarration(this.round, this.round - prevRound);
  },
  updateNarration: function(currentRound, variation) {
    console.log(currentRound, variation)

    if(variation > 0) {
      for(i = 1; i<=variation; i++) {
        if((currentRound + i) in this.narration) {
          $('#vizTitle p').html(this.narration[currentRound + i]);
        }
      }
    } else {
      for(i = -1; i>=variation; i--) {
        if((currentRound + i) in this.narration) {
          $('#vizTitle p').html(this.narration[currentRound + i]);
        }
      }
    }
  },
  getInterval: function() {
    if(this.synchedMovie) {
      return this.intervalMovie;
    }
    return this.interval;
  },
  autoPlay: function() {
    this.stop();
    $('#stop').removeClass('hidden');
    $('#autoPlay').addClass('hidden');
    this.currentInterval = setInterval(this.nextRound.bind(this), this.getInterval())
  },
  stop: function() {
    $('#stop').addClass('hidden');
    $('#autoPlay').removeClass('hidden');
    clearInterval(this.currentInterval);
  },
  toggleOptions: function() {
    if(this.showingOptions) {
      this.showingOptions = false;
      this.viewRef.drawer.animate({'left':-180});
    } else {
      this.showingOptions = true;
      this.viewRef.drawer.animate({'left':0});
    }
  },
  toggleMovie: function() {
     if(this.synchedMovie) {
      this.viewRef.movie.removeClass('enabled');
      this.viewRef.movie.addClass('disabled');
      this.synchedMovie = false;
    } else {
      this.viewRef.movie.addClass('enabled')
      this.viewRef.movie.removeClass('disabled');
      this.synchedMovie = true;
    }
  },
  toggleGeo: function() {
    if(this.showingGeo) {
      this.viewRef.geo.removeClass('enabled');
      this.viewRef.geo.addClass('disabled');
      this.removeGeoLayer();
    } else {
      this.viewRef.geo.addClass('enabled')
      this.viewRef.geo.removeClass('disabled');
      this.drawGeoLayer();
    }
  },
  getDate: function(round, short) {
    var day = Math.floor(((round/5)+20) % 30) +1;
    var month = (Math.floor(((round/5) + 22) / 30)+8) % 12;
    var month_names = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december'
    ]
    if(short) {
      return month_names[month] + ' ' + day;
    }
    return day + ' - ' + month_names[month] + ' 3001 of the third age'
  }

}
lotr.narration = {};
$.ajax({
  url: 'http://xabel.cartodb.com/api/v1/sql?q=select%20*%20from%20lotr_narration',
  dataType: 'json',
  success: function(res) {
    for(var i in res.rows) {
      lotr.narration[res.rows[i].round] = res.rows[i].description;
    }
  }
})
window.onload = lotr.init.bind(lotr);
