$(function() {
  window.Flair = {
    scrollTimeout: null,

    boot: function() {
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

    delegateEvents: function() {
      Flair.initNavLinks();
      Flair.initScrollListeners();
      Flair.initForms();
      Flair.initMenuBtn();

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

    initMenuBtn: function() {
      $(document).on("click", ".menu-btn", function(ev){
        ev.preventDefault();

        $("body").toggleClass("menu-open");
      });
    }
  };

  Flair.boot();
});