
class View {
    constructor() {
        // never used?
        this.header = document.querySelector('.header__container');
        // never used?
        this.searchForm = document.querySelector('.search')
        
        // if there is only one instance of a searchbar in the dom, I would rathe use a unique id.
        this.input = document.querySelector('.search__bar_content');
        this.autocomplete = document.querySelector('.autocomplete');

        this.repositories = document.querySelector('.repositories');

    }

    clearRepos() {
        // why a loop? wrap results into a container 
        while (this.autocomplete.firstChild) {
            // bad naming - results
            this.autocomplete.removeChild(this.autocomplete.firstChild);
        }
    }

    clearInput() {
        this.input.value = '';
    }

    /**
     * use jsDoc: @link https://jsdoc.app/
     * @param {array} gitHubRepositories 
     */ 
    createAutocomplete(arrayOfRepos) {

        this.autocomplete.removeEventListener('click', this.handleAutocompleteClick);

        const fragment = document.createDocumentFragment();
        
        arrayOfRepos.forEach(repo => {
            // 2 options, create a private method createResultNode
            // or use .innerHtml to reduce complexity + HtmlComponent class
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
        this.autocomplete.addEventListener('click', this.handleAutocomplete(event));
    }

    _handleAutocoplete = (event) => {
        let target = event.target.closest('.autocomplete__box');
        this._createRepoData(arrayOfRepos, target);
    }

    _createRepoData(dataRepos, elementDOM) {
        const id = elementDOM.getAttribute('data-repo-id');

        const result = dataRepos.find((repo) => repo.id = id)

        if (null === result) {
            return;
        }
        this.createRepoBoxData(result);
    }

    createRepoBoxData(repoCurrent) {

        const repoDataBox = document.createElement('div');
        repoDataBox.classList.add('repositories__box');
    
        const repoDataInfo = document.createElement('div');
        repoDataInfo.classList.add('repositories__info');
    
        const deleteRepoDataBox = document.createElement('button');
        deleteRepoDataBox.classList.add('repositories__delete-box');
        
        // if you allready use interpolation i would create a utility class
        // that returns the whole html whith a set of strings
        let arrayOfTitleContent = [`Name: ${repoCurrent.name}`,`Owner: ${repoCurrent.owner.login}`, `Stars: ${repoCurrent.stargazers_count}`]
    
        const fragmentRepoContentData = document.createDocumentFragment()
        fragmentRepoContentData.innerHtml = HtmlComponents.myHtmlComponent(
            repoCurrent.name,
            repoCurrent.owner.login,
            repoCurrent.stargazers_count
        )


        // all this can be probably solved by the component approach.

        // this.repositories.appendChild(repoDataBox);
        // repoDataBox.appendChild(repoDataInfo);
        // repoDataBox.appendChild(deleteRepoDataBox);
        // repoDataInfo.appendChild(fragmentRepoContentData);

        this.clearRepos()
        this.clearInput()

        // not sure what it does, should be refactored into a private method with an expressive name
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
    /**
     * @param {View} view 
     * @param {GitHubApi} api 
     */
    constructor(view, gitHubApi) {
        this.view = view;
        this.gitHubApi = gitHubApi;
        this.currentInputValue = ''; 
        

        this.view.input.addEventListener('keyup', this._debounceSearch(
            this.searchRepos.bind(this), 450)
            );
    }

    /**
     * @param {event} event 
     */
    async searchRepos(event) {
        const inputValue = event.target.value;
        
        if (inputValue == '') { 
            return;
        }
        this.view.clearRepos();
        this._reposRequest(inputValue);
    }

    /**
     * mark yout methods as private if they are not supposed to use in other classes. 
     * the convention in vanilla js is _myPrivateFunction
     * @param {string} value 
     */
    async _reposRequest(value) {
        const data = await this.gitHubApi.getGithubRepositories(value);
        await this.view.createAutocomplete(data.items)
    }

    _debounceSearch(fn, debounceTime) {
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
}


class GitHubApi {
    /**
     * @param {string} value 
     * @returns {json}
     */
    async getGithubRepositories(value) {
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

class HtmlComponents { 
    /**
     * 
     * @param {string} name 
     * @param {string} owner 
     * @param {string} stars 
     * @return {string}
     */
    static myHtmlComponent(name, owner, stars) {
        return `<div class="my-class">
        <div class="name">
            ${name}
        </div>
        <div class="repo">
            ${owner}
        </div>
        <div class="stars">
            ${stars}
        </div>
    </div>`
    }
}

const gitHubApi = new GitHubApi();
const app = new Search(new View(), gitHubApi);



