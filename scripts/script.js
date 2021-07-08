const headerCityButton = document.querySelector('.header__city-button');
const goodsTitle = document.querySelector('.goods__title');
const navigationList = document.querySelector('.navigation__list');
let hash = location.hash.substring(1);

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

const getGoods = (callback, value) => {
	// пытаемся получить данные и обработать ошибку
	getData()
		.then(data => {
			if(value) {
				callback(data.filter(item => item.category === value));
			} else {
				callback(data);
			}
		})
		.catch(err => {
			console.error(err);
		});
};


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

try {
	const goodsList = document.querySelector('.goods__list');
	if(!goodsList) {
		throw 'This is not a goods page';
	}
	
	// создаем 1 карточку товара
	const createCard = ({id, preview, cost, brand, name, sizes}) => {
		const li = document.createElement('li');
		li.classList.add('goods__item');
		li.innerHTML = `
		<article class="good">
            <a class="good__link-img" href="card-good.html#${id}">
                <img class="good__img" src="goods-image/${preview}" alt="">
            </a>
            <div class="good__description">
                <p class="good__price">${cost} &#8381;</p>
                <h3 class="good__title">${brand}<span class="good__title__grey">/ ${name}</span></h3>
				${sizes ? 
					`<p class="good__sizes">Размеры (RUS): <span class="good__sizes-list">${sizes.join(' ')}</span></p>` : ''}
                
                <a class="good__link" href="card-good.html#${id}">Подробнее</a>
            </div>
        </article>`;
		return li;
	};
	// добавляем все карты на страницу
	const renderGoodsList = data => {
		goodsList.textContent = '';
		data.forEach(item => {
			const card = createCard(item);
			goodsList.append(card);
		});
	};

	window.addEventListener('hashchange', () => {
		hash = location.hash.substring(1);
		getGoods(renderGoodsList, hash);
		
	});

	getGoods(renderGoodsList, hash);

} catch (err) {
	console.warn(err);
}

navigationList.addEventListener('click', event => {
	const target = event.target;
	if(target.matches('.navigation__link')) {
		goodsTitle.textContent = target.textContent;
	}
});