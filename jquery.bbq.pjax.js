(function($, undefined){
  
  var registry = {}

  $.fn.bbq_pjax = function(options){
    var options = $.extend({
      linkSelector: 'a'
    }, options)
    
    // Only use the first matched element as the content container.
    this.first().each(function(){
      var $container = $(this)
      
      $(options.linkSelector).live('click', function(event){
        $link = $(event.srcElement)
        
        if (!$link.hasClass('pjax-registered')) {
          // Store anchors in a registry by their URLs
          var url = rootRelativeUrl($link.attr( 'href' ))
          registry[url] = registry[url] || []
          registry[url].push($link)
          
          // Store the content container on this anchor
          $link.data('pjaxContainer', $container)
          // Store the options on this anchor
          $link.data('pjaxOptions', options)

          // Mark this link as being registered, to prevent re-registry.
          $link.addClass('pjax-registered')
        }

        // Get the url from the link's href attribute, stripping any leading #.
        $.bbq.pushState( $link.attr( 'href' ).replace( /^#/, '' ), 2 )
        // Prevent the default link click behavior.
        return false
      })
      
      
    })
  }

  var rootRelativeUrl = function(url){
    var l = window.location
    if (url.indexOf('http') === 0) {
      return url.replace(/^(?:\/\/|[^\/]+)*\//, '/') 
    } else if (url.indexOf('/') === 0) {
      return url
    } else {
      var path = l.pathname.split('/')
      path.pop()
      path.push(url)
      return path.join('/')
    }
  }

  var currentUrl = function(){
    return ($.support.pushState) 
      ? window.location.href.replace(/^(?:\/\/|[^\/]+)*\//, '/') 
      : window.location.hash.replace(/^#/, '')
  }

  var lastURL = currentUrl()
  
  // Bind an event to window.onhashchange
  $(window).bind( 'hashchange', function(e) {
    var url = currentUrl()
    if (url === lastURL) { return }
    lastURL = url;
    
    var rel_url = rootRelativeUrl(url)
    if (registry[rel_url] && registry[rel_url].length) {
      // Currently, this is just guessing the container by the url of the link.
      // TODO: Make this a little more clever.
      var $container = registry[rel_url][0].data('pjaxContainer');
      $container.load(url, function(){
      })
    }
  })
  
  // Since the event is only triggered when the hash changes, we need to trigger
  // the event now, to handle the hash the page may have loaded with.
  $(window).trigger( 'hashchange' );

})(jQuery)
