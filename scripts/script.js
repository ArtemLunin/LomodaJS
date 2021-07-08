const headerCityButton = document.querySelector('.header__city-button');

headerCityButton.textContent = localStorage.getItem('lomoda-location') || 'Ваш город?';

headerCityButton.addEventListener('click', () => {
	const city = prompt('Укажите Ваш город');
	headerCityButton.textContent = city;
	localStorage.setItem('lomoda-location', city);
});

// блокировка скрола
const disableScroll = () => {
	// "неправильная" реализация - за счет убирания полосы прокрутки смещается верстка на странице
	// document.body.style.overflow = 'hidden';
	// правильная
	// вычисляем ширину полосы прокрутки
	const widthScroll = window.innerWidth - document.body.offsetWidth;
	// запомним свойство scrollY
	document.body.dbScrollY = window.scrollY;
	document.body.style.cssText = `
		position: fixed;
		top: ${-window.scrollY}px;
		left: 0;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		padding-right: ${widthScroll}px;
	`;
};

const enableScroll = () => {
	document.body.style.cssText = '';
	// восстанавливаем значение скролла
	window.scroll({
		top: document.body.dbScrollY,
	});
	// = ;
};

// модальное окно

const subheaderCart = document.querySelector('.subheader__cart');
const cartOverlay = document.querySelector('.cart-overlay');

const cartModalOpen = () => {
	cartOverlay.classList.add('cart-overlay-open');
	disableScroll();
};

const cartModalClose = () => {
	cartOverlay.classList.remove('cart-overlay-open');
	enableScroll();
};

// запрос к базе данных
// используем асинхронную функцию
const getData = async () => {
	// await ждет пока fetch не вернет ответ
	const data = await fetch('db.json');
	if(data.ok) {
		return data.json();
	} else {
		throw new Error(`Данные не были получены, ошибка ${data.status} ${data.statusText}`);
	}
}

const getGoods = (callback) => {
	// пытаемся получить данные и обработать ошибку
	getData()
		.then(data => {
			callback(data);
		})
		.catch(err => {
			console.error(err);
		});
};

getGoods((data) => {
	console.log(data);
});

subheaderCart.addEventListener('click', cartModalOpen);


// делегируем событие чтобы обработка шла по элементам внутри cartOverlay
cartOverlay.addEventListener('click', event => {
	const target = event.target;
	// 1-й способ определения элемента внутри контейнера
	// if(target.classList.contains('cart__btn-close')) {
	// 	cartModalClose();
	// }
	// 2-й способ
	if(target.matches('.cart__btn-close') || target.matches('.cart-overlay')) {
		cartModalClose();
	}
});
