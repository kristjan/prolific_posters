var baseUrl = false;

$(document).ready(function() {
    if(baseUrl === false) window.alert("Couldn't find your locker, you might need to add a config.js (see dev.singly.com)");
});

Prolific = (function() {
  var container;
  var PAGE_SIZE = 100;
  var loading = true;

  function init() {
    container = $('#prolific');
    $('.header .stop').click(stopLoading);
    loadLinks(1);
  }

  var loadTimeout;
  function loadLinks(page) {
    if (!loading) {
      $('.header .stop').replaceWith(
        $('<span>', { 'class' : 'stop' }).
          css({ 'display' : 'none' }).
          text('Finished.').fadeIn()
      );
      return;
    }

    var offset = (page - 1) * PAGE_SIZE;

    $.getJSON(baseUrl + '/Me/links/',
      {'fields' : '{"from":1,"title":1,"link":1}', 'limit' : PAGE_SIZE, 'offset' : offset, 'full' : true},
      function(data) {
        buildLinks(data);
        if (data.length < PAGE_SIZE) { loading = false; }
        loadTimeout = setTimeout(function() {
          clearTimeout(loadTimeout);
          loadLinks(page + 1);
        }, 1000);
      }
    );
  }

  function stopLoading(evt) {
    evt.preventDefault();
    loading = false;
    $('.header .stop').fadeOut();
    return false;
  }

  function buildLinks(data) {
    if(!data || data.length === 0) { return; }
    for(var i in data) {
      var datum = data[i];
      var people = findOrCreatePeople(datum);
      $.each(people, function(i, person) {addLink(person, datum)});
    }
    updateTotal(data.length);
    sort();
  }

  function updateTotal(count) {
    var total = $('.header .total');
    total.text(parseInt(total.text(), 10) + count);
  }

  function addLink(person, datum) {
    $('ul', person).append(
      $('<li>').append(
        $('<a>', { 'href' : datum.link}).html(datum.title)
      )
    );
    var count = parseInt(person.attr('data-count'), 10) + 1;
    person.attr('data-count', count);
    $('.count', person).text(count);
    if (count > 4) {
      person.addClass('scrollable');
    }
  }

  function findOrCreatePeople(datum) {
    return $.map(datum.encounters, findOrCreatePerson);
  }

  function findOrCreatePerson(encounter) {
    var slug = slugify(encounter.from);
    var person = $('#' + slug);
    if (person.length === 0) {
      person = $('<div>', {
        'id' : slug,
        'data-id' : slug,
        'class' : 'person clearfix',
        'data-count' : 0
      }).append(
        $('<div>', { 'class' : 'info' }).append(
          $('<h3>').text(encounter.from),
          $('<p>').append(
            $('<span>', { 'class' : 'count' }).text(0),
            ' links'
          )
        ),
        $('<ul>', { 'class' : 'links' }),
        $('<span>', { 'class' : 'scroll' }).html("Scroll &darr;")
      );
      container.append(person);
    }
    return person;
  }

  function slugify(name) {
    return 'person-' + name.toLowerCase().replace(/\W+/g, '_');
  }

  function sort() {
    var data = $('.person', container).clone();
    data.sort(function(a,b) {
      return parseInt($(b).attr('data-count'), 10) -
             parseInt($(a).attr('data-count'), 10);
    });
    container.quicksand(data);
  }

  return {
    init : init
  }
})();

$(function() {
  Prolific.init();
});

