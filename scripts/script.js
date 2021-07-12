const headerCityButton = document.querySelector('.header__city-button');
const cartListGoods = document.querySelector('.cart__list-goods');
const cartTotalCost = document.querySelector('.cart__total-cost');
// модальное окно
const subheaderCart = document.querySelector('.subheader__cart');
const cartOverlay = document.querySelector('.cart-overlay');

let hash = location.hash.substring(1);

headerCityButton.textContent = localStorage.getItem('lomoda-location') || 'Ваш город?';

headerCityButton.addEventListener('click', () => {
	const city = prompt('Укажите Ваш город');
	headerCityButton.textContent = city;
	localStorage.setItem('lomoda-location', city);
});

// работа с localStorage
const getLocalStorage = () => JSON?.parse(localStorage.getItem('cart-lomoda')) || [];
const setLocalStorage = data => localStorage.setItem('cart-lomoda', JSON.stringify(data));

const renderCart = () => {
	cartListGoods.textContent = '';
	const cartItems = getLocalStorage();

	let totalPrice = 0;

	cartItems.forEach((item, i) => {
		const tr = document.createElement('tr');
		tr.innerHTML = `
            <td>${i+1}</td>
            <td>${item.brand} ${item.name}</td>
			${item.color ? `<td>${item.color}</td>` : '<td>-</td>'}
            ${item.size ? `<td>${item.size}</td>` : '<td>-</td>'}
            <td>${item.cost}</td>
            <td><button class="btn-delete" data-id="${item.id}">&times;</button></td>
		`;
		totalPrice += item.cost;
		cartListGoods.append(tr);
	});

	cartTotalCost.textContent = totalPrice;
};

const deleteItemCart = id => {
	const cartItems = getLocalStorage();
	const newCartItems = cartItems.filter(item => item.id !== id);
	setLocalStorage(newCartItems);
};

cartListGoods.addEventListener('click', e => {
	if(e.target.matches('.btn-delete')) {
		deleteItemCart(e.target.dataset.id);
		renderCart();
	}
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



const cartModalOpen = () => {
	cartOverlay.classList.add('cart-overlay-open');
	disableScroll();
	renderCart();
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

const getGoods = (callback, prop, value) => {
	// пытаемся получить данные и обработать ошибку
	getData()
		.then(data => {
			if(value) {
				callback(data.filter(item => item[prop] === value));
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

// страница категорий
try {
	const goodsList = document.querySelector('.goods__list');
	if(!goodsList) {
		throw 'This is not a goods page';
	}
	
	const goodsTitle = document.querySelector('.goods__title');
	const changeTitle = () => {
		// с помощью такого css-селекторра получаем хэш из соотв. ссылки
		goodsTitle.textContent = document.querySelector(`[href*="#${hash}"]`).textContent;
	};

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
		changeTitle();
		getGoods(renderGoodsList, 'category', hash);
		
	});

	changeTitle();
	getGoods(renderGoodsList, 'category', hash);

} catch (err) {
	console.warn(err);
}

// страница товара
try {
	if(!document.querySelector('.card-good')) {
		throw 'This is not a card-good page';
	}
	const cardGoodImage = document.querySelector('.card-good__image');
	const cardGoodBrand = document.querySelector('.card-good__brand');
	const cardGoodTitle = document.querySelector('.card-good__title');
	const cardGoodPrice = document.querySelector('.card-good__price');
	const cardGoodColor = document.querySelector('.card-good__color');
	
	// таких элементов на странице несколько, поэтому получаем все
	const cardGoodSelectWrapper = document.querySelectorAll('.card-good__select__wrapper');

	const cardGoodColorList = document.querySelector('.card-good__color-list');
	const cardGoodSizes = document.querySelector('.card-good__sizes');
	const cardGoodSizesList = document.querySelector('.card-good__sizes-list');
	const cardGoodBuy = document.querySelector('.card-good__buy');

	//формируем список (например, доступных цветов), добавляя каждый элемент массива в конец списка
	const generateList = data => data.reduce((html, item, i) => html + 
	`<li class="card-good__select-item" data-id="${i}">${item}</li>`, '');

	// так как getGoods возвращает нам массив, то здесь принимаем только 0-й элемент (1 товар)
	const renderCardGood = ([{id, brand, name, cost, color, sizes, photo}]) => {
		const data = {brand, name, cost, id};

		cardGoodImage.src = `goods-image/${photo}`;
		cardGoodImage.alt = `${brand} ${name}`;
		cardGoodBrand.textContent = brand;
		cardGoodTitle.textContent = name;
		cardGoodPrice.textContent = `${cost} UAH`;
		if(color) {
			cardGoodColor.textContent = color[0];
			cardGoodColor.dataset.id = 0;
			cardGoodColorList.innerHTML = generateList(color);
		} else {
			cardGoodColor.style.display = 'none';
		}
		if(sizes) {
			cardGoodSizes.textContent = sizes[0];
			cardGoodSizes.dataset.id = 0;
			cardGoodSizesList.innerHTML = generateList(sizes);
		} else {
			cardGoodSizes.style.display = 'none';
		}

		if(getLocalStorage().some(item => item.id === id)) {
			//если при открытии товара он уже есть в корзине, то меняем надпись на кнопке на 'удалить из корзины'
			cardGoodBuy.classList.add('delete');
			cardGoodBuy.textContent = 'Удалить из корзины';
		}

		cardGoodBuy.addEventListener('click', () => {
			if(cardGoodBuy.classList.contains('delete')) {
				console.log('delete');
				deleteItemCart(id);
				cardGoodBuy.classList.remove('delete');
				cardGoodBuy.textContent = 'Добавить в корзину';
				return;
			}
			if(color) {
				data.color = cardGoodColor.textContent;
			}
			if(sizes) {
				data.size = cardGoodSizes.textContent;
			}

			// когда товар добавлен в корзину - меняем надпись кнопки на удалить
			cardGoodBuy.classList.add('delete');
			cardGoodBuy.textContent = 'Удалить из корзины';

			//новые данные из корзины объединяем с ранее сохраненными
			const cardData = getLocalStorage();
			cardData.push(data);
			setLocalStorage(cardData);
		});

	};

	// события для нажатия на кнопку раскрытия списка (цвет, размер)
	cardGoodSelectWrapper.forEach(item => {
		item.addEventListener('click', e => {
			const target = e.target;
			if(target.closest('.card-good__select')) {
				target.classList.toggle('card-good__select__open');
			}
			if(target.closest('.card-good__select-item')) {
				const cardGoodSelect = item.querySelector('.card-good__select');
				cardGoodSelect.textContent = target.textContent;
				cardGoodSelect.dataset.id = target.dataset.id;
				cardGoodSelect.classList.remove('card-good__select__open');
			}
		});
	});


	getGoods(renderCardGood, 'id', hash);
} catch (err) {
	console.warn(err);
}
