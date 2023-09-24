
class View {
    constructor() {
        this.header = document.querySelector('.header__container');
        this.searchForm = document.querySelector('.search')
        this.input = document.querySelector('.search__bar_content');
        this.autocomplete = document.querySelector('.autocomplete');

        this.repositories = document.querySelector('.repositories');

    }

    clearRepos() {
        while (this.autocomplete.firstChild) {
            this.autocomplete.removeChild(this.autocomplete.firstChild);
        }
    }

    clearInput() {
        this.input.value = '';
    }

    createAutocomplete(arrayOfRepos) {

        this.autocomplete.removeEventListener('click', this.handleAutocompleteClick);

        const fragment = document.createDocumentFragment();
        
        arrayOfRepos.forEach(repo => {
            const box = document.createElement('div');
            box.classList.add('autocomplete__box');
            box.setAttribute('data-repo-id', repo.id);
    
            const content = document.createElement('span');
            content.classList.add('autocomplete__content');
            content.textContent = `${repo.name}`;
    
            fragment.appendChild(box)
            box.appendChild(content);
        });

        this.autocomplete.appendChild(fragment);    
    
        this.handleAutocompleteClick = (event) => {
            let target = event.target.closest('.autocomplete__box');
            this.createRepoData(arrayOfRepos, target);
        };
        
        this.autocomplete.addEventListener('click', this.handleAutocompleteClick); 
    }

    createRepoData(dataRepos, elementDOM) {
        const id = elementDOM.getAttribute('data-repo-id');

        const repoCurrent = dataRepos.filter((repo) => {
            if (repo.id == id) {
                return repo
            } 
        })
        

        if (repoCurrent[0]) {
            this.createRepoBoxData(repoCurrent[0])
        } else return
    
    }

    createRepoBoxData(repoCurrent) {

        const repoDataBox = document.createElement('div');
        repoDataBox.classList.add('repositories__box');
    
        const repoDataInfo = document.createElement('div');
        repoDataInfo.classList.add('repositories__info');
    
        const deleteRepoDataBox = document.createElement('button');
        deleteRepoDataBox.classList.add('repositories__delete-box');
        
        let arrayOfTitleContent = [`Name: ${repoCurrent.name}`,`Owner: ${repoCurrent.owner.login}`, `Stars: ${repoCurrent.stargazers_count}`]
    
        const fragmentRepoContentData = document.createDocumentFragment()
    
        for (let i = 0; i < arrayOfTitleContent.length; i++) {
            const repoDataContent = document.createElement('div');
            repoDataContent.classList.add('repositories__content');
            repoDataContent.textContent = arrayOfTitleContent[i]
    
            fragmentRepoContentData.appendChild(repoDataContent)
        }

        this.repositories.appendChild(repoDataBox);
        repoDataBox.appendChild(repoDataInfo);
        repoDataBox.appendChild(deleteRepoDataBox);
        repoDataInfo.appendChild(fragmentRepoContentData);

        this.clearRepos()
        this.clearInput()

        this.repositories.addEventListener('click', (event) => {
            let target = event.target;
            if (target.classList.contains('repositories__delete-box')) {
                const parent = target.parentElement;
        
                if (parent) parent.remove();
            }
        })
    }
}

class Search {
    constructor(view, api) {
        this.view = view;
        this.api = api;
        this.currentInputValue = ''; 
        

        this.view.input.addEventListener('keyup', this.debounceSearch(this.searchRepos.bind(this), 450));
    }

    async searchRepos() {
        const inputValue = this.view.input.value.trim();
        
        if (inputValue !== '') { 
            this.view.clearRepos();
            this.reposRequest(inputValue);
        }
    }

    debounceSearch(fn, debounceTime) {
        let timer;
        let context;
        let args;
    
        return function () {
            context = this;
            args = arguments;
        
            clearTimeout(timer);
        
            timer = setTimeout(() => {
                fn.apply(context, args);
            }, debounceTime);
        };
    }

    reposRequest() {
        this.api.loadRepos(this.view.input.value).then(data => {
            this.view.createAutocomplete(data.items)
        });
    }
}

class Api {

    async loadRepos(value) {
        
        try {
            const response = await fetch(`https://api.github.com/search/repositories?q=${value}+in:name&per_page=5`);
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return await response.json()
        } catch (error) {
            console.error('Произошла ошибка:', error);
        }
    }
}

const api = new Api();
const app = new Search(new View(), api);



