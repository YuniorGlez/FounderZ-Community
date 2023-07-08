import './styles.css';

let people = [];
let currentPage = 1;
const pageSize = 25;
const peopleContainer = document.getElementById('people');
const categoriesContainer = document.getElementById('categories');
const searchInput = document.getElementById('search');
const loader = document.getElementById('loader');
const linkedinCheckbox = document.getElementById('linkedin');
const paginationContainer = document.getElementById('pagination');

let currentFilters = {
    linkedin: false,
    search: '',
    page: 1
};

linkedinCheckbox.addEventListener('change', function () {
    currentFilters.linkedin = this.checked;
    updateURL();
    fetchPeople();
});

function updateURL() {
    const params = new URLSearchParams();
    params.set('linkedin', currentFilters.linkedin);
    params.set('search', currentFilters.search);
    params.set('page', currentFilters.page);
    window.history.replaceState({}, '', '?' + params.toString());
}

searchInput.addEventListener('input', function () {
    currentFilters.search = this.value.toLowerCase();
    updateURL();
    fetchPeople();
});


function createPersonCard(person) {
    const div = document.createElement('div');
    div.className = 'p-4 border rounded shadow';
    div.innerHTML = `
        <img src="${person.avatar}" alt="${person.name}" class="w-full h-32 object-cover mb-2 rounded">
        <h2 class="text-xl mb-2">${person.name}</h2>
        <p class="mb-2">${person.role}</p>
        `;
    div.innerHTML += person.linkedin ? `<a href="${person.linkedin}" target="_blank" rel="noopener noreferrer" class="text-blue-500">Ver LinkedIn</a>` : "";
    return div;
}

function createCategoryButton(category) {
    const button = document.createElement('button');
    button.className = 'p-2 m-1 bg-blue-500 text-white rounded';
    button.textContent = category;
    button.addEventListener('click', function () {
        const filteredPeople = people.filter(person => person.role === category);
        displayPeople(filteredPeople);
    });
    return button;
}
function displayPeople(people) {
    peopleContainer.innerHTML = '';
    for (const person of people) {
        const personCard = createPersonCard(person);
        peopleContainer.appendChild(personCard);
    }
    document.getElementById('displayedCount').textContent = people.length;
}

function displayCategories(categories) {
    categoriesContainer.innerHTML = '';
    for (const category of categories) {
        const categoryButton = createCategoryButton(category);
        categoriesContainer.appendChild(categoryButton);
    }
}



function displayPagination(totalPages) {
    paginationContainer.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.className = 'p-2 m-1 bg-blue-500 text-white rounded';
        button.textContent = i;
        button.addEventListener('click', function () {
            currentFilters.page = i;
            updateURL();
            fetchPeople();
        });
        paginationContainer.appendChild(button);
    }
}


// Fetch data from an API// Fetch data from an API
// Fetch data from an API
function fetchPeople() {
    loader.style.display = 'block';
    const linkedinFilter = currentFilters.linkedin ? 'linkedin_ne=&' : '';
    const searchFilter = currentFilters.search ? `name_like=${currentFilters.search}&` : '';
    fetch(`https://api.community-founderz.com/users?${linkedinFilter}${searchFilter}_page=${currentFilters.page}&_limit=${pageSize}`)
        .then(async response => {
            const totalCount = response.headers.get('X-Total-Count');
            return {
                totalCount,
                data: await response.json()
            }
        })
        .then(res => {
            people = res.data;
            const categories = [...new Set(people.map(person => person.role))];
            displayPeople(people);
            displayCategories(categories);
            displayPagination(Math.round(res.totalCount / pageSize));
            loader.style.display = 'none'; // Hide the loader
            localStorage.setItem('people', JSON.stringify(people)); // Save the data in localStorage
            document.getElementById('totalCount').textContent = res.totalCount;
        })
        .catch(error => console.error('Error:', error));
}




// Load the data from localStorage if available
const savedPeople = localStorage.getItem('people');
if (savedPeople) {
    people = JSON.parse(savedPeople);
    const categories = [...new Set(people.map(person => person.role))];
    displayPeople(people);
    displayCategories(categories);
    loader.style.display = 'none';
    fetchPeople();
} else {
    fetchPeople();
}


// On page load, check URL for filters
window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('linkedin')) {
        currentFilters.linkedin = params.get('linkedin') === 'true';
        linkedinCheckbox.checked = currentFilters.linkedin;
    }
    if (params.has('search')) {
        currentFilters.search = params.get('search');
        searchInput.value = currentFilters.search;
    }
    if (params.has('page')) {
        currentPage = Number(params.get('page'));
    }
    fetchPeople();
});