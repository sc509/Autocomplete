const wrapperInput = document.querySelector('.wrapper__input');
const results = document.querySelector('.results');
const errorElement = document.querySelector('.error');


function createElement(tagName, className) {
    const element = document.createElement(tagName);
    element.classList.add(className);
    return element;
};


function debounce(func, delay) {
    let timeoutId;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function() {
            func.apply(context, args);
        }, delay);
    };
};


const rep = createElement('ul', 'wrapper__list');
const listSelected = createElement('ul', 'wrapper__list-selected');

results.appendChild(rep);
results.appendChild(listSelected);


function insertDataInElement(selectedLi, li, liButton, listSelected) {
    const newElement = document.createElement('div');
    const nameText = document.createTextNode(`Name: ${li.textContent}`);
    const ownerText = document.createTextNode(`Owner: ${li.dataset.owner}`);
    const starsText = document.createTextNode(`Stars: ${li.dataset.stars}`);
    const br1 = document.createElement('br');
    const br2 = document.createElement('br');

    newElement.appendChild(nameText);
    newElement.appendChild(br1);
    newElement.appendChild(ownerText);
    newElement.appendChild(br2);
    newElement.appendChild(starsText);

    selectedLi.insertBefore(newElement, selectedLi.firstChild);

    selectedLi.appendChild(liButton);

    listSelected.appendChild(selectedLi);

    liButton.addEventListener('click', function() {
        listSelected.removeChild(selectedLi);
    });
};


function procceningQueryResults (data, inputValue){
    data.items.forEach(res => {
        const li = createElement('li', 'list__element');
        li.textContent = res.name;
        li.dataset.owner = res.owner.login;
        li.dataset.stars = res.stargazers_count;

        li.addEventListener('click', function() {
            rep.removeChild(li);
            const selectedLi = createElement('li', 'list__element-selected');
            const liButton = createElement('button', 'wrapper__list-button')
            insertDataInElement(selectedLi, li, liButton, listSelected);
            wrapperInput.value = '';
            rep.textContent = '';
        });
        rep.appendChild(li);
    });
};


async function searchRep(event) {
    try {
        rep.textContent = '';
        errorElement.textContent = '';
        const inputValue = event.target.value.trim();
        if (!inputValue) {
            return;
        };
        const response = await fetch(`https://api.github.com/search/repositories?q=${inputValue}&per_page=5`);
        if (response.ok) {
            const data = await response.json();
            if (inputValue !== event.target.value.trim()) {
                return;
            }
           procceningQueryResults(data,inputValue);
        } else {
            throw new Error('Ошибка при выполнении запроса');
        }
    } catch (error) {
        console.error(error);
        errorElement.textContent = 'Произошла ошибка при выполнении запроса';
    };
};

const debouncedSearchRep = debounce(searchRep, 400);

wrapperInput.addEventListener('input', debouncedSearchRep);
