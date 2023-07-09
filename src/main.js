import './styles.css';

let people = [];
let roles = [];
const pageSize = 25;
const peopleContainer = document.getElementById('people');
const rolesContainer = document.getElementById('roles');
const searchInput = document.getElementById('search');
const loader = document.getElementById('loader');
const linkedinCheckbox = document.getElementById('linkedin');
const paginationContainer = document.getElementById('pagination');

let currentFilters = {
    linkedin: false,
    search: '',
    page: 1,
    role: ''
};
const clearFiltersButton = document.getElementById('clearFilters');

clearFiltersButton.addEventListener('click', function () {
    currentFilters = {
        linkedin: false,
        search: '',
        page: 1,
        role: ''
    };
    searchInput.value = '';
    linkedinCheckbox.checked = false;
    updateURL();
    fetchPeople();
    displayRoles(roles);
});


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
    params.set('role', currentFilters.role);
    window.history.replaceState({}, '', '?' + params.toString());
}

searchInput.addEventListener('input', function () {
    currentFilters.search = this.value.toLowerCase();
    updateURL();
    fetchPeople();
});

function createPersonCard(person) {
    const div = document.createElement('div');
    div.className = 'p-4 border rounded shadow relative';
    div.innerHTML = `
        <img src="${person.avatar}" alt="${person.name}" class="w-full h-32 object-cover mb-2 rounded">
        <h2 class="text-xl mb-2">${person.name}</h2>
        <p class="mb-2">${person.role}</p>
        `;
    div.innerHTML += person.linkedin ? `<a href="${person.linkedin}" target="_blank" rel="noopener noreferrer" class="text-blue-500">Ver LinkedIn</a>` : "";

    const modal = document.createElement('div');
    modal.className = 'modal hidden absolute bottom-250 left-1/2 transform -translate-x-1/2 mt-2 p-2 bg-blue-100 rounded shadow-lg z-10 w-80';
    modal.innerHTML = `
        <h2 class="text-sm mb-1">${person.name}'s first message</h2>
        <p class="text-xs">${person.messages[0]}</p>
    `;
    div.appendChild(modal);

    div.addEventListener('mouseover', function () {
        modal.classList.remove('hidden');
    });

    div.addEventListener('mouseout', function () {
        modal.classList.add('hidden');
    });

    return div;
}

function createRoleButton(role) {
    const button = document.createElement('button');
    button.className = 'p-2 m-1 rounded';
    button.textContent = role;
    if (role === currentFilters.role) {
        button.classList.add('bg-blue-500', 'text-white');
    } else {
        button.classList.add('text-blue-500');
    }
    button.addEventListener('click', function () {
        currentFilters.role = role;
        updateURL();
        fetchPeople();
        displayRoles(roles)
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

function displayRoles(roles) {
    rolesContainer.innerHTML = '';
    for (const role of roles) {
        const roleButton = createRoleButton(role);
        rolesContainer.appendChild(roleButton);
    }
}

function displayPagination(totalPages) {
    paginationContainer.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.className = 'p-2 m-1 text-blue-500 rounded';
        if (i === currentFilters.page) {
            button.classList.add('bg-blue-500', 'text-white');
        }
        button.textContent = i;
        button.addEventListener('click', function () {
            currentFilters.page = i;
            updateURL();
            fetchPeople();
        });
        paginationContainer.appendChild(button);
    }
}

function fetchPeople() {
    loader.style.display = 'block';
    const linkedinFilter = currentFilters.linkedin ? 'linkedin_ne=&' : '';
    const searchFilter = currentFilters.search ? `name_like=${currentFilters.search}&` : '';
    const rolesFilter = currentFilters.role ? `role=${currentFilters.role}&` : '';
    return fetch(`https://api.community-founderz.com/users?${linkedinFilter}${searchFilter}${rolesFilter}_page=${currentFilters.page}&_limit=${pageSize}`)
        .then(async response => {
            const totalCount = response.headers.get('X-Total-Count');
            return {
                totalCount,
                data: await response.json()
            }
        })
        .then(res => {
            people = res.data;
            displayPeople(people);
            displayPagination(Math.round(res.totalCount / pageSize));
            loader.style.display = 'none';
            localStorage.setItem('people', JSON.stringify(people));
            document.getElementById('totalCount').textContent = res.totalCount;
        })
        .catch(error => console.error('Error:', error));
}

function fetchroles() {
    return fetch('https://api.community-founderz.com/roles')
        .then(response => response.json())
        .then(_roles => {
            displayRoles(_roles);
            roles = _roles
        })
        .catch(error => console.error('Error:', error));
}

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
        currentFilters.page = Number(params.get('page'));
    }
    if (params.has('role')) {
        currentFilters.role = params.get('role');
    }

    const savedPeople = localStorage.getItem('people');
    if (savedPeople) {
        people = JSON.parse(savedPeople);
        displayPeople(people);
        loader.style.display = 'none';
        fetchPeople();
        fetchroles();
    } else {
        fetchPeople();
        fetchroles();
    }

});
