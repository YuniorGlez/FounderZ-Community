import './styles.css';

const mockData = [
    { name: 'Persona 1', role: 'Diseñador', thumbnail: 'https://via.placeholder.com/150', linkedin: '#' },
    { name: 'Persona 2', role: 'Gerente de Proyecto', thumbnail: 'https://via.placeholder.com/150', linkedin: '#' },
    { name: 'Persona 3', role: 'Investigador', thumbnail: 'https://via.placeholder.com/150', linkedin: '#' },
    { name: 'Persona 4', role: 'C-level', thumbnail: 'https://via.placeholder.com/150', linkedin: '#' },
    { name: 'Persona 5', role: 'Desarrollador', thumbnail: 'https://via.placeholder.com/150', linkedin: '#' },
    // Añade más personas aquí
];

let people = [];
const peopleContainer = document.getElementById('people');
const categoriesContainer = document.getElementById('categories');
const searchInput = document.getElementById('search');

function createPersonCard(person) {
    const div = document.createElement('div');
    div.className = 'p-4 border rounded shadow';
    div.innerHTML = `
        <img src="${person.thumbnail}" alt="${person.name}" class="w-full h-32 object-cover mb-2 rounded">
        <h2 class="text-xl mb-2">${person.name}</h2>
        <p class="mb-2">${person.role}</p>
        <a href="${person.linkedin}" target="_blank" rel="noopener noreferrer" class="text-blue-500">Ver LinkedIn</a>
    `;
    return div;
}

function createCategoryButton(category) {
    const button = document.createElement('button');
    button.className = 'p-2 m-1 bg-blue-500 text-white rounded';
    button.textContent = category;
    button.addEventListener('click', function() {
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
}

function displayCategories(categories) {
    categoriesContainer.innerHTML = '';
    for (const category of categories) {
        const categoryButton = createCategoryButton(category);
        categoriesContainer.appendChild(categoryButton);
    }
}

// Simulate fetching data from an API
setTimeout(() => {
    people = mockData;
    const categories = [...new Set(people.map(person => person.role))];
    displayPeople(people);
    displayCategories(categories);
    loader.style.display = 'none'; // Oculta el loader
    localStorage.setItem('people', JSON.stringify(people)); // Guarda los datos en localStorage
}, 1000);

searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const filteredPeople = people.filter(person =>
        person.name.toLowerCase().includes(searchTerm) ||
        person.role.toLowerCase().includes(searchTerm)
    );
    displayPeople(filteredPeople);
});

// Carga los datos desde localStorage si están disponibles
const savedPeople = localStorage.getItem('people');
if (savedPeople) {
    people = JSON.parse(savedPeople);
    const categories = [...new Set(people.map(person => person.role))];
    displayPeople(people);
    displayCategories(categories);
    loader.style.display = 'none'; // Oculta el loader
}