//= require jquery
//= require jquery_ujs
//= require jquery.delayed-observer.js

reinstallBehavior = (context)->
    $('form.comment:not(.installed)', context).each ->
        $(this).addClass('installed')
        form = this
        textarea = $('textarea', form)
        textarea.delayedObserver ->
            callback = (html)->
                $('.preview .content', form).html(html)
            $.get('./admin/comments/preview', content: textarea.val(), callback) 

$(document).ready ->
    reinstallBehavior()

