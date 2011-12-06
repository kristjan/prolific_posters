var baseUrl = false;

$(document).ready(function() {
    if(baseUrl === false) window.alert("Couldn't find your locker, you might need to add a config.js (see dev.singly.com)");
});

Prolific = (function() {
  var PAGE_SIZE = 500;

  var loading = true;
  var everyone = $("<div>");

  function init() {
    $('.header .stop').click(stopLoading);
    loadLinks(1);
  }

  function loadLinks(page) {
    if (!loading) {
      finish();
      return;
    }

    var offset = (page - 1) * PAGE_SIZE;

    $.getJSON(baseUrl + '/Me/links/', {
        'fields' : '{"encounters.from":1,"title":1,"link":1}',
        'limit' : PAGE_SIZE,
        'offset' : offset,
        'full' : true
      }, function(data) {
        if (data.length < PAGE_SIZE) { loading = false; }
        loadLinks(page + 1);
        updateTotal(data.length);
        buildLinks(data);
      }
    );
  }

  function stopLoading(evt) {
    evt.preventDefault();
    loading = false;
    $('.header .stop').fadeOut();
    return false;
  }

  function finish() {
    $('.header .stop').replaceWith(
      $('<span>', { 'class' : 'stop' }).
        css({ 'display' : 'none' }).
        text('Finished.').fadeIn()
    );
    sort();
  }

  function buildLinks(data) {
    if(!data || data.length === 0) { return; }
    for(var i in data) {
      var datum = data[i];
      var people = findOrCreatePeople(datum);
      $.each(people, function(i, person) {addLink(person, datum)});
    }
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
    var person = $('#' + slug, everyone);
    if (person.length === 0) {
      person = $('<div>', {
        'id' : slug,
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
      everyone.append(person);
    }
    return person;
  }

  function slugify(name) {
    if (name == null) {
      return 'person-undefined';
    }

    return 'person-' + name.toLowerCase().replace(/\W+/g, '_');
  }

  function sort() {
    var data = $('.person', everyone).clone();
    data.sort(function(a,b) {
      return parseInt($(b).attr('data-count'), 10) -
             parseInt($(a).attr('data-count'), 10);
    });
    $('#prolific').hide().append(data).fadeIn();
  }

  return {
    init : init
  }
})();

$(function() {
  Prolific.init();
});

