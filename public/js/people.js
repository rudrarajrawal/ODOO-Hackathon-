let personModal;

document.addEventListener('DOMContentLoaded', () => {
    personModal = new bootstrap.Modal(document.getElementById('personModal'));
    
    loadPeople();

    document.getElementById('personForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await savePerson();
    });
});

async function loadPeople() {
    try {
        const people = await api.get('/people');
        const tbody = document.getElementById('peopleTableBody');
        tbody.innerHTML = '';

        people.forEach(p => {
            const tr = document.createElement('tr');
            
            // Generate standardized star rating
            let ratingHTML = '';
            if (p.type === 'Supplier') {
                const rating = p.rating || 0;
                for (let i = 1; i <= 5; i++) {
                    ratingHTML += i <= rating 
                        ? '<i class="bi bi-star-fill text-warning"></i> ' 
                        : '<i class="bi bi-star text-muted"></i> ';
                }
            } else {
                ratingHTML = '-';
            }
            
            tr.innerHTML = `
                <td>${p.id}</td>
                <td class="fw-bold">${p.name}</td>
                <td><span class="badge ${p.type === 'Supplier' ? 'bg-info' : 'bg-primary'}">${p.type}</span></td>
                <td>${p.phone || '-'}</td>
                <td>${p.email || '-'}</td>
                <td>${p.address || '-'}</td>
                <td>${ratingHTML}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick='editPerson(${JSON.stringify(p).replace(/'/g, "&#39;")})'>Edit</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deletePerson('${p.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading people', error);
        alert('Failed to load contact directory.');
    }
}

function openAddModal() {
    document.getElementById('personForm').reset();
    document.getElementById('personId').value = '';
    document.getElementById('personRating').value = 0;
    document.getElementById('modalTitle').textContent = 'ADD NEW CONTACT';
}

function editPerson(person) {
    document.getElementById('personId').value = person.id;
    document.getElementById('personName').value = person.name;
    document.getElementById('personType').value = person.type;
    document.getElementById('personPhone').value = person.phone;
    document.getElementById('personEmail').value = person.email;
    document.getElementById('personAddress').value = person.address;
    document.getElementById('personRating').value = person.rating || 0;
    
    document.getElementById('modalTitle').textContent = 'EDIT CONTACT';
    personModal.show();
}

async function savePerson() {
    const id = document.getElementById('personId').value;
    const data = {
        name: document.getElementById('personName').value,
        type: document.getElementById('personType').value,
        phone: document.getElementById('personPhone').value,
        email: document.getElementById('personEmail').value,
        address: document.getElementById('personAddress').value,
        rating: parseInt(document.getElementById('personRating').value) || 0
    };

    try {
        if (id) {
            await api.put(`/people/${id}`, data);
        } else {
            await api.post('/people', data);
        }
        personModal.hide();
        loadPeople();
    } catch (error) {
        alert(error.message || 'Failed to save contact');
    }
}

async function deletePerson(id) {
    if (confirm('Are you sure you want to delete this contact?')) {
        try {
            await api.delete(`/people/${id}`);
            loadPeople();
        } catch (error) {
            alert('Failed to delete contact');
        }
    }
}
