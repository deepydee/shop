$(function() {
	
	'use strict';

	// Модуль приложения

	var app = (function($) {
		
		var $body = $('body'),
		page = $body.data('page'),
		options = {
			elAddToCart: '.js-add-to-cart',
			attrId: 'data-id',
			attrName: 'data-name',
			attrPrice: 'data-price',
			attrDelta: 'data-delta',
			elCart: '#cart',
			elTotalCartCount: '#total-cart-count',
			elTotalCartSumma: '#total-cart-summa',
			elCartItem: '.js-cart-item',
			elCartCount: '.js-count',
			elCartSumma: '.js-summa',
			elChangeCount: '.js-change-count',
			elRemoveFromCart: '.js-remove-from-cart',
			elOrder: '#order'
		},
		optionsCatalog = _.extend({
			renderCartOnInit: false,
			renderMenuCartOnInit: true
		}, options),
		optionsCart = _.extend({
			renderCartOnInit: true,
      renderMenuCartOnInit: true
		}, options),
		optionsOrder = _.extend({
			renderCartOnInit: false,
			renderMenuCartOnInit: true
		}, options);

		function init() {
			if (page === 'catalog') {
				catalog.init();
				cart.init(optionsCatalog);
			}
			if (page === 'cart') {
				cart.init(optionsCart);
			}
			if (page === 'order') {
				order.init();
        cart.init(optionsOrder);
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


	// Модуль корзины
	var cart = (function($) {
		
		var cartData, // данные корзины - массив объектов
				opts = {}; // настройки модуля

	// Инициализация модуля
	function init(options) {
		_initOptions(options);
		updateData();
		if(opts.renderCartOnInit) {
			renderCart();
		}
		if(opts.renderMenuCartOnInit) {
			renderMenuCart();
		}
		_bindHandlers();
	}

	// Инициализируем настройки
	function _initOptions(options) {
		var defaultOptions = {
			renderCartOnInit: true, 										// рендерить ли корзину при инициализации
			renderMenuCartOnInit: true,									// рендерить ли количество товаров в меню при инициализации
			elAddToCart: '.js-add-to-cart',							// селектор для кнопки добавления в корзину
			attrId: 'data-id',              						// дата-атрибут для id товара
			attrName: 'data-name',          						// дата-атрибут для названия товара
			attrPrice: 'data-price',        						// дата-атрибут для цены товара
			attrDelta: 'data-delta',        						// дата-атрибут, показывающий, на сколько нужно изменить количество товара в корзине (-1 и 1)
			elCart: '#cart',                						// селектор для содержимого корзины
			elTotalCartCount: '#total-cart-count',      // селектор для количества товаров в корзине
			elTotalCartSumma: '#total-cart-summa',      // селектор для общей суммы заказа
			elCartItem: '.js-cart-item',                // селектор для отдельного пункта корзины
			elCartCount: '.js-count',                   // селектор для количества отдельного товара
			elCartSumma: '.js-summa',                   // селектор для суммы отдельного товара
			elChangeCount: '.js-change-count',          // селектор для кнопок изменения количества
			elRemoveFromCart: '.js-remove-from-cart',   // селектор для кнопки удаления из корзины
			elOrder: '#order'                           // селектор для кнопки оформления заказа     
		}
		_.defaults(options || {}, defaultOptions);
		opts = _.clone(options);
	}

	// Навешивам события
	function _bindHandlers() {
		_onClickAddBtn();
    _onClickChangeCountInCart();
    _onClickRemoveFromCart();
	}

	// Получаем данные
	function updateData() {
		cartData = JSON.parse(localStorage.getItem('cart')) || [];
		return cartData;
	}

	// Возвращаем данные
	function getData() {
		return cartData;
	}

	// Сохраняем данные в localStorage
	function saveData() {
		localStorage.setItem('cart', JSON.stringify(cartData));
		return cartData;
	}

	// Очищаем данные
	function clearData() {
		cartData = [];
		saveData();
		return cartData;
	}

	// Поиск объекта в коллекции cartData по id
	function getById(id) {
		return _.findWhere(cartData, {id: id});
	}

	// Добавление товара в коллекцию
	function add(item) {
		var oldItem;
		updateData();
		oldItem = getById(item.id);
		if(!oldItem) {
			cartData.push(item);
		} else {
			oldItem.count = oldItem.count + item.count;
		}
		saveData();
		return item;
	}

	// Удаление товара из коллекции
	function remove(id) {
		updateData();
		cartData = _.reject(cartData, function(item) {
			return item.id === id;
		});
		saveData();
		return cartData;
	}

	// Изменение количества товара в коллекции
	function changeCount(id, delta) {
		var item;
		updateData();
		item = getById(id);
		if(item) {
			item.count = item.count + delta;
			if(item.count < 1) {
				remove(id);
			}
			saveData();
		}
		return getById(id) || {};
	}

	// Возвращаем количество товаров (количество видов товаров в корзине)
	function getCount() {
		return _.size(cartData);
	}

	// Возвращаем общее количество товаров 
	function getCountAll() {
		return _.reduce(cartData, function(sum, item) {return sum + item.count}, 0);
	}

	// Возвращаем общую сумму
	function getSumma () {
		return _.reduce(cartData, function(sum, item) {return sum + item.count * item.price}, 0)
	}

	// Рендерим корзину
	function renderCart() {
		var template = _.template($('#cart-template').html()),
				data = {
						goods: cartData
				};
		$(opts.elCart).html(template(data));
		renderTotalCartSumma();
	}

	// Рендерим количество товаров в меню
	function renderMenuCart() {
		var countAll = getCountAll();
		$(opts.elTotalCartCount).html(countAll !== 0 ? countAll : '');
	}

	// Рендерим общую сумму товаров
	function renderTotalCartSumma() {
			$(opts.elTotalCartSumma).html(getSumma());            
	}

	// Поиск продукта в корзине по id
	function findCartElemById(id) {
		return $(opts.elCartItem + '[' + opts.attrId + '="'+id+'"]');
	}

	// Добавление в корзину
	function _onClickAddBtn() {
		$('body').on('click', opts.elAddToCart, function(e) {
				var $this = $(this);
				add({
						id: +$this.attr(opts.attrId),
						name: $this.attr(opts.attrName),
						price: +$this.attr(opts.attrPrice),
						count: 1
				});    
				renderMenuCart();
				alert('Товар добавлен в корзину');
		});
	}

	// Меняем количество товаров в корзине
	function _onClickChangeCountInCart() {
		$('body').on('click', opts.elChangeCount, function(e) {
				var $this = $(this),
						id = +$this.attr(opts.attrId),
						delta = +$this.attr(opts.attrDelta),
						$cartElem = findCartElemById(id),
						cartItem = changeCount(id, delta);
				if (cartItem.count) {
						$cartElem.find(opts.elCartCount).html(cartItem.count);
						$cartElem.find(opts.elCartSumma).html(cartItem.count * cartItem.price);
				} else {
						$cartElem.remove();
				}
				renderMenuCart();
				renderTotalCartSumma();
		});
	}

	// Удаляем товар из корзины
	function _onClickRemoveFromCart() {
		$('body').on('click', opts.elRemoveFromCart, function(e) {
				if(!confirm('Удалить товар из корзины?')) return false;
				var $this = $(this),
						id = +$this.attr(opts.attrId),
						$cartElem = findCartElemById(id);
				remove(id);
				$cartElem.remove();
				renderMenuCart();
				renderTotalCartSumma();
		});
	}

 
	// Экспортируем наружу
	return {
		init: init,
		update: updateData,
		getData: getData,
		save: saveData,
		clearData: clearData,
		getById: getById,
		add: add,
		remove: remove,
		changeCount: changeCount,
		getCount: getCount,
		getCountAll: getCountAll,
		getSumma: getSumma
}

	})(jQuery);


	// Модуль заказа

	var order = (function($) {

		var ui = {
			$orderForm: $('#order-form'),
			$messageCart: $('#order-message'),
			$orderBtn: $('#order-btn'),
			$alertValidation: $('#alert-validation'),
			$alertOrderDone: $('#alert-order-done'),
			$orderMessageTemplate: $('#order-message-template'),
			$fullSumma: $('#full-summa'),
			$delivery: {
				type: $('#delivery-type'),
				summa: $('#delivery-summa'),
				btn: $('.js-delivery-type'),
				alert: $('#alert-delivery')
			}
		};

		var freeDelivery = {
			enabled: false,
			summa: 10000
		};

		// Инициализация модуля
		function init() {
			_renderMessage();
			_checkCart();
			_initDelivery();
      _bindHandlers();
		}

		// Меняем способ доставки
    function _changeDelivery() {
			var $item = ui.$delivery.btn.filter(':checked'),
					deliveryType = $item.attr('data-type'),
					deliverySumma = freeDelivery.enabled ? 0 : +$item.attr('data-summa'),
					cartSumma = cart.getSumma(),
					fullSumma = deliverySumma + cartSumma,
					alert =
							freeDelivery.enabled
									? 'Мы дарим Вам бесплатную доставку!'
									:
											'Сумма доставки ' + deliverySumma + ' рублей. ' +
											'Общая сумма заказа: ' +
											cartSumma + ' + ' + deliverySumma + ' = ' + fullSumma + ' рублей';

			ui.$delivery.type.val(deliveryType);
			ui.$delivery.summa.val(deliverySumma);
			ui.$fullSumma.val(fullSumma);
			ui.$delivery.alert.html(alert);
		}

		// Инициализация доставки
    function _initDelivery() {
			// Устанавливаем опцию бесплатной доставки
			freeDelivery.enabled = (cart.getSumma() >= freeDelivery.summa);

			// Навешиваем событие на смену способа доставки
			ui.$delivery.btn.on('change', _changeDelivery);

			_changeDelivery();
		}


		// Рендерим сообщение о количестве товаров и общей сумме
		function _renderMessage() {
			var template = _.template(ui.$orderMessageTemplate.html()),
					data;
			cart.update();
			data = {
				count: cart.getCountAll(),
				summa: cart.getSumma()
			};
			ui.$messageCart.html(template(data));
		}

		// В случае пустой корзины отключаем кнопку Отправки заказа
		function _checkCart() {
			if( cart.getCountAll === 0 ) {
				ui.$orderBtn.attr('disabled', 'disabled');
			}
		}

		// Навешивам события
		function _bindHandlers() {
			ui.$orderForm.on('click', '.js-close-alert', _closeAlert);
			ui.$orderForm.on('submit', _onSubmitForm);
		}

		// Закрытие alert-а
    function _closeAlert(e) {
			$(e.target).parent().attr('hidden', 'hidden');
		}

		// Валидация формы
		function _validate() {
			var formData = ui.$orderForm.serializeArray(),
					name = _.find(formData, {name: 'name'}).value,
					email = _.find(formData, {name: 'email'}).value,
					isValid = (name !== '') && (email !== '');
			return isValid;
		}

		// Подготовка данных корзины к отправке заказа
		function _getCartData() {
			var cartData = cart.getData();
			_.each(cart.getData(), function(item) {
				item.name = encodeURIComponent(item.name);
			});
			return cartData;
		}

		// Оформляем заказ
		function _onSubmitForm(e) {
			var isValid,
					formData,
					cartData,
					orderData;
			e.preventDefault();
			ui.$alertValidation.attr('hidden', 'hidden');
			isValid = _validate();
			if (!isValid) {
					ui.$alertValidation.removeAttr('hidden');
					return false;
			}
			formData = ui.$orderForm.serialize();
			cartData = _getCartData();
			orderData = formData + '&cart=' + JSON.stringify(cartData);
			ui.$orderBtn.attr('disabled', 'disabled').text('Идет отправка заказа...');
			$.ajax({
					url: 'scripts/order.php',
					data: orderData,
					type: 'POST',
					cache: false,
					dataType: 'json',
					error: _orderError,
					success: function(responce) {
							if (responce.code === 'success') {
									_orderSuccess(responce);
							} else {
									_orderError(responce);
							}
					},
					complete: _orderComplete
			});
		}

		// Успешная отправка
		function _orderSuccess(responce) {
			console.info('responce', responce);
			ui.$orderForm[0].reset();
			cart.clearData();
			ui.$alertOrderDone.removeAttr('hidden');
		}

		// Ошибка отправки
		function _orderError(responce) {
			console.error('responce'. responce)
			// Далее обработка ошибки, зависит от фантазии
		}

		// Отправка завершилась
		function _orderComplete() {
			ui.$orderBtn.removeAttr('disabled').text('Отправить заказ');
		}

		// Экспортируем наружу
		return {
			init: init
		}

	})(jQuery);

});
