let productModal;

document.addEventListener('DOMContentLoaded', () => {
    productModal = new bootstrap.Modal(document.getElementById('productModal'));
    
    loadProducts();
    loadSuppliers();

    document.getElementById('productForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProduct();
    });

    document.getElementById('productSearch').addEventListener('input', applyFilters);
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
});

let allProducts = [];

async function loadProducts() {
    try {
        allProducts = await api.get('/products');
        populateCategoryFilter();
        applyFilters();
    } catch (error) {
        console.error('Error loading products', error);
        alert('Failed to load products.');
    }
}

function populateCategoryFilter() {
    const filter = document.getElementById('categoryFilter');
    const categories = [...new Set(allProducts.map(p => p.category))];
    
    // Save current selection
    const current = filter.value;
    filter.innerHTML = '<option value="">ALL_CATEGORIES</option>';
    
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat.toUpperCase();
        filter.appendChild(option);
    });
    
    filter.value = current;
}

function applyFilters() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const selectedCategory = document.getElementById('categoryFilter').value;
    
    const filtered = allProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !selectedCategory || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    
    renderProducts(filtered);
}

function renderProducts(products) {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';

    products.forEach(p => {
        const isLowStock = p.stock <= 10;
        const tr = document.createElement('tr');
        if(isLowStock) tr.classList.add('table-danger-row');
        
        tr.innerHTML = `
            <td>${p.id}</td>
            <td class="fw-bold">${p.name}</td>
            <td><span class="badge bg-secondary">${p.category}</span></td>
            <td>${p.supplier_name || 'N/A'}</td>
            <td>₹${p.price.toFixed(2)}</td>
            <td>
                <span class="badge ${isLowStock ? 'badge-low-stock' : 'badge-success-neon'}">
                    ${p.stock}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-dark" onclick='viewQR(${JSON.stringify(p).replace(/'/g, "&#39;")})'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-qr-code" viewBox="0 0 16 16">
                      <path d="M2 2h2v2H2V2Z"/><path d="M6 0v6H0V0h6ZM5 1H1v4h4V1ZM4 12H2v2h2v-2Z"/><path d="M6 10v6H0v-6h6Zm-5 1v4h4v-4H1Zm11-9h2v2h-2V2Z"/><path d="M10 0v6h6V0h-6Zm5 1v4h-4V1h4ZM8 1V0h1v2H8v2H7V1h1Zm0 5V4h1v2H8ZM6 8V7h1V6h1v2h1V7h5v1h-4v1h2v1h-1v2h1v1h1v1h-3v-1h-1v-2h-2v2h-1v-2H9v-1H8v1H7V8h1ZM2 8v1h2V8H2Zm1 9h1v1H3v-1Zm1-4h1v1H4v-1Zm3 3H6v1h1v-1Zm2-1h1v1H9v-1Zm2 3h1v1h-1v-1Zm1-4h1v1h-1v-1Zm2 3h1v1h-1v-1Zm-4-11h1v1h-1V5Zm3 4h1v1h-1V9Zm-1 1h1v1h-1v-1ZM8 2h1v1H8V2Z"/><path d="M3 5v2h1V5H3Zm4 0v2h1V5H7Zm-3 2v2h1V7H4Zm3 2v2h1V9H7Zm-4 2v2h1v-2H3Zm4 0v2h1v-2H7Zm-3 2v2h1v-2H4Zm3 0v2h1v-2H7Z"/>
                    </svg>
                </button>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-2" onclick='editProduct(${JSON.stringify(p).replace(/'/g, "&#39;")})'>Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${p.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function loadSuppliers() {
    try {
        const people = await api.get('/people');
        const suppliers = people.filter(p => p.type === 'Supplier');
        const select = document.getElementById('productSupplier');
        
        suppliers.forEach(s => {
            const option = document.createElement('option');
            option.value = s.id;
            option.textContent = s.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load suppliers', error);
    }
}

function openAddModal() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('modalTitle').textContent = 'ADD NEW PRODUCT';
}

function editProduct(product) {
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productSupplier').value = product.supplier_id;
    
    document.getElementById('modalTitle').textContent = 'EDIT PRODUCT';
    productModal.show();
}

async function saveProduct() {
    const id = document.getElementById('productId').value;
    const data = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        supplier_id: document.getElementById('productSupplier').value
    };

    try {
        if (id) {
            await api.put(`/products/${id}`, data);
        } else {
            await api.post('/products', data);
        }
        productModal.hide();
        loadProducts();
    } catch (error) {
        alert(error.message || 'Failed to save product');
    }
}

async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await api.delete(`/products/${id}`);
            loadProducts();
        } catch (error) {
            alert('Failed to delete product');
        }
    }
}

function viewQR(product) {
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    
    document.getElementById('qrProductName').textContent = product.name.toUpperCase();
    
    new QRCode(qrContainer, {
        text: `PROD_ID_${product.id}_${product.category}_${product.name}`,
        width: 128,
        height: 128,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
    
    new bootstrap.Modal(document.getElementById('qrModal')).show();
}

async function exportProductsCSV() {
    try {
        const products = await api.get('/products');
        if (!products || products.length === 0) {
            alert('No products to export.');
            return;
        }

        const csvRows = [
            ['ID', 'Name', 'Category', 'Price (INR)', 'Stock', 'Supplier'],
            ...products.map(p => [
                p.id,
                `"${p.name.replace(/"/g, '""')}"`,
                `"${p.category.replace(/"/g, '""')}"`,
                p.price,
                p.stock,
                `"${p.supplier_name || 'N/A'}"`
            ])
        ];

        const csvString = csvRows.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `Inventrix_Products_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        notifications.show('Product catalog exported successfully!', 'success');
    } catch (error) {
        console.error('Export failed', error);
        alert('Failed to export CSV.');
    }
}
