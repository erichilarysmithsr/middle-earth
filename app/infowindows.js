window.lotr = window.lotr || {}
$(document).ready(function(){

  window.lotr.infowindow = {
    character: {
      fields: [{ name: 'image', title: false},
        { name: 'character', title: false},
        { name: 'description', title: false}
      ],
      eventType: 'featureOver',
      template: $('#infoTemplate').html(),
      templateType: 'underscore',
    },
    places: {
      fields: [{name: 'image', title: false},
        {name: 'name', title: false},
        {name: 'description', title: false},
      ],
      eventType: 'featureOver',
      template: $('#infoTemplatePlace').html(),
      templateType: 'underscore'
    }
  };
})
