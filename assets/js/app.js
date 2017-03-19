$(function() {
  window.Flair = {
    config: window.config,
    sections: [],
    scrollTimeout: null,

    initialize: _.bind(function() {
      $.ajax({
        method: "GET",
        url: config.docs_url
      })
      .done(Flair.boot)
      .fail(function(){
        console.error("Could not fetch docs from:", config.docs_url)
      });
    }, this),

    boot: function(docs) {
      window.addEventListener('popstate', Flair.toHashSection);

      Flair.buildSections(docs);
      Flair.setTitle(docs.info.title);
      Flair.renderNav();
      Flair.renderContent();

      Flair.ready();
    },

    ready: function() {
      Flair.delegateEvents();
      PR.prettyPrint();

      $('.app-loading').fadeOut(300, function(){
        $(this).remove();

        Flair.toHashSection();

        setTimeout(function() {
          $('body').removeClass('loading');
        }, 300);
      });
    },

    buildSections: function(docs) {
      var paths = docs.paths,
          collection, slug, fresh;

      Flair.sections = [{
        slug: "home",
        title: "Home",
        paths: [{
          title: docs.info.title,
          description: docs.info.description,
          slug: "top"
        }]
      }];

      _.each(paths, function(data, url) {
        _.each(data, function(props, method) {
          slug = props.tags[0].toLowerCase().replace(/[^a-z0-9 -_]/g, "").replace(/ /, "-");

          collection = _.find(Flair.sections, function(section) {
            return section.slug === slug;
          });

          fresh = !collection;

          if (fresh) {
            collection = {
              slug: slug,
              title: props.tags[0],
              paths: []
            };
          }

          collection.paths.push({
            method: method,
            url: url,
            slug: props.title.toLowerCase().replace(/[^a-z0-9 -_]/g, "").replace(/ /g, "-"),
            title: props.title,
            description: props.description,
            params: props.parameters,
            responses: props.responses
          });

          if (fresh) {
            Flair.sections.push(collection);
          } else {
            Flair.sections = _.map(Flair.sections, function(section) {
              if (section.slug === slug) {
                return collection;
              } else {
                return section;
              }
            });
          }
        });
      });
    },

    setTitle: function(title) {
      $('.js-app-title').html(title + " docs");
      $('title').html(title + " docs");
    },

    renderNav: function() {
      var $nav = $('.nav');

      $nav.prepend(ejs.render($nav.find('script').html(), {
        sections: Flair.sections
      }));
    },

    renderContent: function() {
      var $content = $('.content');

      $content.prepend(ejs.render($content.find('script').html(), {
        sections: Flair.sections,
        base_url: Flair.config.base_url
      }));
    },

    delegateEvents: function() {
      Flair.initNavLinks();
      Flair.initScrollListeners();
      Flair.initForms();

      setTimeout(Flair.onScroll, 300);
    },

    initNavLinks: function() {
      $(document).on("click", ".nav a, .anchor", function(ev) {
        ev.preventDefault();

        var $link = $(ev.currentTarget),
            $right = $(".right"),
            href = $link.attr("href"),
            top = $(href).offset().top,
            main = $link.attr("data-main") === "true";

        if (history.pushState && ev.originalEvent) history.pushState(null, null, href);

        if (!main) top -= 69;

        $right.animate({
          scrollTop: $right.scrollTop() + top
        }, 300);

        if (main) {
          $(".nav > ul > li.active").removeClass("active");
          $link.closest("li").addClass("active");
        }
      });
    },

    initScrollListeners: function() {
      var $right = $(".right"),
          $section;

      $(".section > .title").each(function(i, section){
        $section = $(section);
        $section.attr("data-top", $section.offset().top);
      });

      $right.on("scroll.content", Flair.onScroll);
    },

    onScroll: function(timeout) {
      var $right = $(".right"),
          $section,
          top = $right.scrollTop();

      $(".section > .title").each(function(i, section){
        $section = $(section);

        if (parseInt($section.attr("data-top"), 10) <= top) {
          if (!$section.hasClass("fixed")) {
            var id = $section.closest(".section").attr("id");

            $section.addClass("fixed");

            clearTimeout(Flair.scrollTimeout);
            Flair.scrollTimeout = setTimeout(function() {
              $(".nav li").removeClass("active");
              $(".nav a[href='#"+id+"']").closest("li").addClass("active");
            }, 300);
          }

        } else {
          if ($section.hasClass("fixed")) {
            var id = $section.closest(".section").attr("id");
            var $li = $(".nav a[href='#"+id+"']").closest("li");

            $section.removeClass("fixed");

            clearTimeout(Flair.scrollTimeout);
            Flair.scrollTimeout = setTimeout(function() {
              $(".nav li").removeClass("active");
              $li.prev().addClass("active");
            }, 300);
          }
        }
      });
    },

    toHashSection: function() {
      if (!window.location.hash) {
        $('.right').animate({ scrollTop: 0 }, 300);
        return;
      }

      var $link = $(".nav a[href='" + window.location.hash + "']");
      if (!$link) return;
      $link.trigger("click");
    },

    initForms: function() {
      $(document).on("submit", "form", function(ev){
        ev.preventDefault();

        var $form = $(ev.currentTarget);
        var $btn = $form.find(".form-actions button");

        if ($btn.hasClass("processing")) return;
        $btn.addClass("processing");

        $.ajax({
          method: $form.attr("method"),
          url: $form.attr("action"),
          data: $form.serialize()
        })
        .done(function(resp, status, xhr) {
          Flair.formResponse($form, $btn, xhr.status, xhr.responseJSON);
        })
        .fail(function(xhr) {
          Flair.formResponse($form, $btn, xhr.status, xhr.responseJSON);
        });
      });

      $(document).on("click", ".form-response a.close", function(ev) {
        ev.preventDefault();
        $(ev.currentTarget).closest(".form-response").slideUp();
      });
    },

    formResponse: function($form, $btn, status, json) {
      $btn.removeClass("processing");

      var $resp = $form.closest(".endpoint").find(".form-response");

      $resp.find(".status span").html(status);
      $resp.find("code").removeClass("prettyprinted").html(JSON.stringify(json, null, 4));

      PR.prettyPrint();

      $resp.slideDown();
    },
  };

  Flair.initialize();
});