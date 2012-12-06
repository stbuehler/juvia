	var $ = Juvia.$ = window.jQuery.noConflict(true);
	
	Juvia.reinstallBehavior = function() {
		var self = this;
		
		if (!$(document.body).hasClass('juvia-installed-behavior')) {
			$(document.body).addClass('juvia-installed-behavior');
			$(document.body).bind('mousedown touchdown', function(event) {
				if (!$(event.target).hasClass('.juvia-help-content')
				 && $(event.target).closest('.juvia-help-content').length == 0) {
					$('.juvia-help-content').hide();
				}
			});
		}
		
		$('.juvia-container:not(.juvia-installed-behavior)').each(function() {
			var $this = $(this);
			$this.addClass('juvia-installed-behavior');
			
			var addCommentForm = $('.juvia-add-comment-form', this);
			
			$('input[name=author_name]', addCommentForm).example('Your name (optional)',
				{ className: 'juvia-example-text' });
			$('input[name=author_email]', addCommentForm).example('Your email (optional)',
				{ className: 'juvia-example-text' });
			
			/* Our submit handler is called before jquery.example has cleared the
			 * example texts. We work around this by calling our actual
			 * submit handler a short while later.
			 */
			addCommentForm.bind('submit', function(event) {
				setTimeout(function() {
					self.submitComment(event);
				}, 1);
			});
			
			$('.juvia-help', this).bind('click', function() {
				var $this = $(this);
				var content = $this.parent().find('.juvia-help-content');
				var offset = $this.position();
				content.css({
					left: offset.left + 'px',
					top: (offset.top + $this.outerHeight() + 8) + 'px'
				});
				content.show();
			});

			var textarea = $('.juvia-textarea-field textarea', addCommentForm);
			textarea.delayedObserver(function() {
				self.previewComment(this);
			});
			
			var errorDiv = $('.juvia-form-actions .juvia-error', addCommentForm);
			addCommentForm.bind('reset', function() {
				errorDiv.hide();
				// Repopulate example texts in input fields.
				setTimeout(function() {
					$('input', addCommentForm).blur();
				}, 1);
			});
		});

		$('.juvia-reply-to-comment a:not(.juvia-installed-behavior)').each(function() {
			var $this = $(this);
			$this.addClass('juvia-installed-behavior');
			$this.bind('click', function() {
				var comment = $(this).closest('.juvia-comment');
				self.replyToComment(comment);
			});
		});
	}
	
	Juvia.findContainer = function(options) {
		return $('.juvia-container[data-site-key="' +
			options.site_key +
			'"][data-topic-key="' +
			options.topic_key +
			'"]');
	}
	
	Juvia.showFormError = function(container, message) {
		var div = $('.juvia-form-actions .juvia-error', container);
		if (message == undefined || message == null || message == '') {
			div.hide();
		} else {
			div.text(message).show();
		}
	}
	
	Juvia.loadScript = function(path, options) {
		var url = Juvia.baseUrl + path;
		
		if (this.supportsCors) {
			url += '.json';
			$.post(url, options, function(response) {
				Juvia.handleResponse(response);
			}, 'json');
		} else {
			url += '.js';
			
			// Makes sure that each loadScript() call generates a unique URL,
			// otherwise the browser may not actually perform the request.
			url += '?_c=' + window._juviaRequestCounter;
			window._juviaRequestCounter++;
			
			var paramString = $.param(options);
			if (paramString.length > 0) {
				url += '&';
				url += paramString;
			}
			
			$('script.juvia').remove();
			
			var s       = document.createElement('script');
			s.async     = true;
			s.type      = 'text/javascript';
			s.className = 'juvia';
			s.src       = url;
			(document.getElementsByTagName('head')[0] ||
			 document.getElementsByTagName('body')[0]).appendChild(s);
		}
	}
	
	Juvia.handleResponse = function(response) {
		this['handle' + response.action](response);
		this.reinstallBehavior();
	}
	
	Juvia.handleLoadTopic = function(options) {
		var $container = $(options.container);
		$container.html(options.html);
		this.restoreCommentBox($container.find('> .juvia-container'));
	}
	
	Juvia.handleAddComment = function(options) {
		var container = this.findContainer(options);
		var comments = $('.juvia-comments', container);
		
		var comment = $(options.html);
		if (comments.hasClass('juvia-no-comments')) {
			comments.removeClass('juvia-no-comments');
			comments.html('');
		}
		if (container.data('comment-order') == 'earliest-first') {
			comment.appendTo(comments);
		} else {
			comment.prependTo(comments);
		}
		$('.juvia-preview-empty', container).show();
		$('.juvia-preview-content', container).hide();
		
		container.find('form')[0].reset();
		this.setSubmitting(container, false);
		this.saveCommentBox(container);
		this.smoothlyScrollTo(comment.offset().top - 20);
		comment.hide().fadeIn(2000);
	}
	
	Juvia.handlePreviewComment = function(options) {
		var container = this.findContainer(options);
		var preview = $('.juvia-preview', container);
		this.showFormError(container, undefined);
		if (options.html.length == 0) {
			preview.find('.juvia-preview-empty').show();
			preview.find('.juvia-preview-content').hide();
		} else {
			preview.find('.juvia-preview-empty').hide();
			preview.find('.juvia-preview-content').html(options.html).show();
		}
	}
	
	Juvia.handleShowError = function(options) {
		if (options.container) {
			var $container = $(options.container);
			$container.html(options.html);
		} else if (options.site_key && options.topic_key) {
			var container = this.findContainer(options);
			container.parent().html(options.html);
		} else if (options.message) {
			alert(options.message);
		} else if (options.html) {
			// Convert HTML to text and display it in a dialog box.
			var div = $('<div></div>');
			div.html(options.html);
			alert($.trim(div.text()));
		} else {
			alert("Juvia unknown error");
		}
	}
	
	Juvia.handleShowFormError = function(options) {
		var container = this.findContainer(options);
		this.showFormError(container, options.text);
		this.setSubmitting(container, false);
	}
	
	Juvia.submitComment = function(event) {
		var form = event.target;
		var $container = $(form).closest('.juvia-container');
		this.setSubmitting($container, true);
		this.saveCommentBox($container);
		this.loadScript('api/add_comment', {
			site_key    : $container.data('site-key'),
			topic_key   : $container.data('topic-key'),
			topic_title : $container.data('topic-title'),
			topic_url   : $container.data('topic-url'),
			author_name : $('input[name="author_name"]', form).val(),
			author_email: $('input[name="author_email"]', form).val(),
			content     : this.compress($('textarea[name="content"]', form).val())
		});
	}
	
	Juvia.previewComment = function(formElement) {
		var $container = $(formElement).closest('.juvia-container');
		this.saveCommentBox($container);
		this.loadScript('api/preview_comment', {
			site_key : $container.data('site-key'),
			topic_key: $container.data('topic-key'),
			content  : this.compress($('textarea[name="content"]', $container).val())
		});
		return false;
	}

	Juvia.setSubmitting = function(container, val) {
		if (val) {
			container.find('.juvia-submit-button').hide();
			container.find('.juvia-submitting-button').show();
		} else {
			container.find('.juvia-submit-button').show();
			container.find('.juvia-submitting-button').hide();
		}
	}

	Juvia.replyToComment = function($comment) {
		var $container = $comment.closest('.juvia-container');
		var text = $('.juvia-comment-pure-content', $comment).text();
		var lines = text.split("\n");
		var i;
		for (i = 0; i < lines.length; i++) {
			lines[i] = '> ' +lines[i];
		}

		var $textarea  = $('textarea', $container);
		var authorName = $.trim($('.juvia-author', $comment).text());
		var newContent = "*" + authorName + " wrote:*\n" + lines.join("\n");
		if ($textarea.val() != '') {
			newContent += "\n\n";
			newContent += $textarea.val();
		}
		$textarea.val(newContent);
		this.smoothlyScrollTo($textarea.offset().top);
		$textarea.focus();
	}

	/* The browser does not save the content of the Juvia comments box when
	 * the user reloads the page. In order to prevent data loss we implement
	 * our own saving capabilities. The text box is saved into sessionStorage
	 * with a key that depends on the site key and the topic key.
	 */

	Juvia.getTextBoxStorageKey = function(container) {
		return 'juvia_text/' +
			container.data('site-key') + '/' +
			container.data('topic-key');
	}

	Juvia.clearAllTextBoxStorage = function(container) {
		var i, key, keysToRemove = [];
		for (key in window.sessionStorage) {
			if (key.match(/^juvia_text\//)) {
				keysToRemove.push(key);
			}
		}
		for (i = 0; i < keysToRemove.length; i++) {
			window.sessionStorage.removeItem(keysToRemove[i]);
		}
	}

	Juvia.saveCommentBox = function(container) {
		if (window.sessionStorage) {
			var key = this.getTextBoxStorageKey(container);
			var value = $('textarea[name="content"]', container).val();
			if (value == '') {
				window.sessionStorage.removeItem(key);
			} else {
				try {
					window.sessionStorage.setItem(key, value);
				} catch (e) {
					if (console) {
						console.warn(e);
					}
					/* It looks like we're hitting the quota limit.
					 * Try to free up some space and try again.
					 *
					 * Even though the standard says that it's supposed to
					 * throw QuotaExceededError, browsers currently don't
					 * actually do that. Instead they throw some kind of
					 * internal exception type. So we don't bother checking
					 * for the exception type.
					 * http://stackoverflow.com/questions/3027142/calculating-usage-of-localstorage-space
					 */
					this.clearAllTextBoxStorage(container);
					try {
						window.sessionStorage.setItem(key, value);
					} catch (e) {
						console.warn(e);
					}
				}
			}
		}
	}

	Juvia.restoreCommentBox = function(container) {
		if (window.sessionStorage) {
			var key = this.getTextBoxStorageKey(container);
			var value = window.sessionStorage.getItem(key);
			if (value !== undefined && value !== null) {
				var textarea = $('textarea[name="content"]', container);
				textarea.val(value);
				this.previewComment(textarea);
			}
		}
	}
	
	
	Juvia.virtualAnimate = function(options) {
		var options = $.extend({
			duration: 1000
		}, options || {});
		var animation_start = this.now();
		var animation_end = this.now() + options.duration;
		var interval = animation_end - animation_start;
		this._virtualAnimate_step(animation_start, animation_end, interval, options);
	}

	Juvia._virtualAnimate_step = function(animation_start, animation_end, interval, options) {
		var self = this;
		var now = new Date();
		var progress = (now - animation_start) / interval;
		if (progress > 1) {
			progress = 1;
		}
		progress = (1 + Math.sin(-Math.PI / 2 + progress * Math.PI)) / 2;
		options.step(progress);
		if (now < animation_end) {
			setTimeout(function() {
				self._virtualAnimate_step(animation_start,
					animation_end, interval, options);
			}, 15);
		} else {
			options.step(1);
			if (options.finish) {
				options.finish();
			}
		}
	}
	
	Juvia.smoothlyScrollTo = function(top) {
		var self = this;
		var $document = $(document);
		var current = $document.scrollTop();
		this.virtualAnimate({
			duration: 300,
			step: function(x) {
				$document.scrollTop(Math.floor(
					top + (1 - x) * (current - top)
				));
			},
			finish: function() {
				self.setScrollTop(top);
			}
		});
	}
	
	Juvia.setScrollTop = function(top, element) {
		// Browsers don't always scroll properly so work around
		// this with a few timers.
		var self = this;
		element = element || $(document);
		element = $(element);
		element.scrollTop(top);
		setTimeout(function() {
			element.scrollTop(top);
		}, 1);
		setTimeout(function() {
			element.scrollTop(top);
		}, 20);
	}
	
	if (Date.now) {
		Juvia.now = Date.now;
	} else {
		Juvia.now = function() {
			return new Date().getTime();
		}
	}
	
	/** UTF-8 encodes the given string. */
	Juvia.encodeUtf8 = function(string) {
		string = string.replace(/\r\n/g, "\n");
		var utftext = "";
		
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			
			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}
		
		return utftext;
	}
	
	/** Casts the given integer as unsigned 32-bit. */
	Juvia.uint32 = function(i) {
		return i >>> 0;
	}
	
	/** Casts the given integer as unsigned 8-bit. */
	Juvia.uint8 = function(i) {
		return i & 0xff;
	}
	
	Juvia.adler32 = function(data) {
		var MOD_ADLER = 65521; // IE doesn't support const
		var a = 1, b = 0;
		var index;
		
		for (index = 0; index < data.length; index++) {
			a = (a + data.charCodeAt(index)) % MOD_ADLER;
			b = (b + a) % MOD_ADLER;
		}
		
		return this.uint32((b << 16) | a);
	}
	
	/** Converts a 32-bit unsigned integer into a 32-bit binary string, big endian encoding. */
	Juvia.uintToBinary = function(i) {
		var buf = [];
		buf[0] = String.fromCharCode(this.uint8((i & 0xff000000) >> 24));
		buf[1] = String.fromCharCode(this.uint8((i & 0xff0000) >> 16));
		buf[2] = String.fromCharCode(this.uint8((i & 0xff00) >> 8));
		buf[3] = String.fromCharCode(this.uint8( i & 0xff ));
		return buf.join('');
	}
	
	Juvia.compress = function(str) {
		if (str.length == 0) {
			return Base64.encode("x\234\003\000\000\000\000\001");
		} else {
			var data = this.encodeUtf8(str);
			data = "\x78\x9c" +
				RawDeflate.deflate(data) +
				this.uintToBinary(this.adler32(data));
			return Base64.encode(data);
		}
	}
	
	Juvia.onApiLoad = function(cb) {
		cb();
	}

	/********* Initialization *********/
	
	if (!('_juviaRequestCounter' in window)) {
		window._juviaRequestCounter = 0;
	}
	
	// Checks whether browser supports Cross-Origin Resource Sharing.
	if (!('supportsCors' in Juvia)) {
		if (window.XMLHttpRequest) {
			var xhr = new XMLHttpRequest();
			Juvia.supportsCors = 'withCredentials' in xhr;
		} else {
			Juvia.supportsCors = false;
		}
	}
	
	
	for (var name in Juvia) {
		if (name != '$' && typeof(Juvia[name]) == 'function') {
			Juvia[name] = $.proxy(Juvia[name], Juvia);
		}
	}

	if (Juvia._onApiLoad) {
		var _onApiLoad = Juvia._onApiLoad;
		delete Juvia._onApiLoad;
		for (var i = 0; i < _onApiLoad.length; ++i) _onApiLoad[i]();
	}
})(Juvia);
