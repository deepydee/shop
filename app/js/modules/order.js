'use strict';

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