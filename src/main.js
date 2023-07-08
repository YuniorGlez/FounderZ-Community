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
            currentPage = i;
            fetchPeople();
        });
        paginationContainer.appendChild(button);
    }
}


// Fetch data from an API
function fetchPeople() {
    loader.style.display = 'block';
    fetch(`https://api.community-founderz.com/users?_page=${currentPage}&_limit=${pageSize}`)
        .then(response => response.json())
        .then(data => {
            people = data;
            const categories = [...new Set(people.map(person => person.role))];
            displayPeople(people);
            displayCategories(categories);
            displayPagination(20);
            loader.style.display = 'none';
            localStorage.setItem('people', JSON.stringify(people));
            document.getElementById('totalCount').textContent = data.totalCount;
        })
        .catch(error => console.error('Error:', error));
}
searchInput.addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();
    const filteredPeople = people.filter(person =>
        person.name.toLowerCase().includes(searchTerm) ||
        person.role.toLowerCase().includes(searchTerm)
    );
    displayPeople(filteredPeople);
});

linkedinCheckbox.addEventListener('change', function () {
    const linkedinFilter = this.checked;
    const filteredPeople = people.filter(person => linkedinFilter ? person.linkedin : true);
    displayPeople(filteredPeople);
});

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