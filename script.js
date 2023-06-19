const wrapperInput = document.querySelector('.wrapper__input');
const results = document.querySelector('.results');
const errorElement = document.querySelector('.error');

function createElement(tagName, className) {
    const element = document.createElement(tagName);
    element.classList.add(className);
    return element;
}

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
}

let isRequestPending = false;
const rep = createElement('ul', 'wrapper__list');
const listSelected = createElement('ul', 'wrapper__list-selected');


results.appendChild(rep);
results.appendChild(listSelected);

async function searchRep() {
    try {
        isRequestPending = true;

        rep.textContent = '';
        errorElement.textContent = '';

        const inputValue = wrapperInput.value.trim();
        if (!inputValue) {
            return;
        }

        const response = await fetch(`https://api.github.com/search/repositories?q=${inputValue}`);
        if (response.ok) {
            const data = await response.json();
            if (inputValue !== wrapperInput.value.trim()) {
                return;
            }
            data.items.slice(0, 5).forEach(res => {
                const li = createElement('li', 'list__element');
                li.textContent = res.name;
                li.dataset.owner = res.owner.login;
                li.dataset.stars = res.stargazers_count;

                li.addEventListener('click', function() {
                    rep.removeChild(li);
                    const selectedLi = createElement('li', 'list__element-selected');
                    const liButton = createElement('button', 'wrapper__list-button')
                    selectedLi.insertAdjacentHTML('afterbegin', `<div>Name: ${li.textContent}<br>Owner: ${li.dataset.owner}<br>Stars: ${li.dataset.stars}</div>`);
                    selectedLi.appendChild(liButton);
                    listSelected.appendChild(selectedLi);
                    liButton.addEventListener('click',function (){
                        listSelected.removeChild(selectedLi);
                    });
                    document.querySelector('.wrapper__input').value = '';
                    rep.textContent = '';
                });
                rep.appendChild(li);
            });

        } else {
            throw new Error('Ошибка при выполнении запроса');
        }
    } catch (error) {
        console.error(error);
        errorElement.textContent = 'Произошла ошибка при выполнении запроса';
    } finally {
        isRequestPending = false;
    }
}

const debouncedSearchRep = debounce(searchRep, 400);

wrapperInput.addEventListener('keyup', debouncedSearchRep);
