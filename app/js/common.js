$(function() {
	
	'use strict';

	// Модуль приложения

	var app = (function($) {
		
		var $body = $('body'),
		page = $body.data('page');

		function init() {
			if (page === 'catalog') {
				catalog.init();
			}
		}

		return {
			init:init
		}

	})(jQuery);

	jQuery(document).ready(app.init);

	// Модуль каталога
	var catalog = (function($) {
	
			// Инициализация модуля
			function init() {
					_render();
			}
	
			// Рендерим каталог
			function _render() {
					var template = _.template($('#catalog-template').html()),
							$goods = $('#goods');
	
					$.getJSON('data/goods.json', function(data) {
							$goods.html(template( {goods: data} )); 
					});
			}
	
	
			// Экспортируем наружу
			return {
					init: init
			}
			
	})(jQuery);

});
