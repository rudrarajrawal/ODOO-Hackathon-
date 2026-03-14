let orderModal;
let toast;

document.addEventListener('DOMContentLoaded', () => {
    orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
    toast = new bootstrap.Toast(document.getElementById('liveToast'));
    
    // Set default date to today
    document.getElementById('orderDate').valueAsDate = new Date();

    loadOrders();
    loadDropdowns();

    document.getElementById('orderForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveOrder();
    });
});

async function loadOrders() {
    try {
        const orders = await api.get('/orders');
        const tbody = document.getElementById('orderTableBody');
        tbody.innerHTML = '';

        orders.forEach(o => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="fw-bold">ID-${o.id ? o.id.toString().padStart(4, '0') : '0000'}</td>
                <td>${o.date}</td>
                <td><span class="text-primary-neon">${o.product_name || 'Unknown'}</span></td>
                <td>${o.customer_name || 'Unknown'}</td>
                <td>${o.quantity} units</td>
                <td>₹${(o.total || 0).toFixed(2)}</td>
                <td>
                    <span class="badge ${o.status === 'Delivered' ? 'bg-success' : 'bg-warning text-dark'}">
                        ${o.status}
                    </span>
                </td>
                <td>
                     <button class="btn btn-sm btn-outline-info" onclick='downloadInvoice(${JSON.stringify(o).replace(/'/g, "&#39;")})'>
                         <i class="bi bi-file-earmark-pdf"></i> PDF
                     </button>
                     <button class="btn btn-sm btn-outline-warning mx-1" onclick='editOrder(${JSON.stringify(o).replace(/'/g, "&#39;")})'>
                         <i class="bi bi-pencil"></i>
                     </button>
                     <button class="btn btn-sm btn-outline-danger" onclick='deleteOrder(${o.id})'>
                         <i class="bi bi-trash"></i>
                     </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading orders', error);
        alert('Failed to load orders.');
    }
}

async function loadDropdowns() {
    try {
        // Load Products
        const products = await api.get('/products');
        const productSelect = document.getElementById('orderProduct');
        products.forEach(p => {
            // Only show products that have stock
            if(p.stock > 0) {
                const option = document.createElement('option');
                option.value = p.id;
                option.textContent = `${p.name} (Stock: ${p.stock})`;
                productSelect.appendChild(option);
            }
        });

        // Load Customers
        const people = await api.get('/people');
        const customers = people.filter(p => p.type === 'Customer');
        const customerSelect = document.getElementById('orderCustomer');
        customers.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.name;
            customerSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Failed to load dropdown data', error);
    }
}

function openAddModal() {
    document.getElementById('orderForm').reset();
    document.getElementById('orderId').value = '';
    document.getElementById('modalTitle').textContent = 'PROCESS NEW ORDER';
    document.getElementById('orderDate').valueAsDate = new Date();
    document.getElementById('orderError').classList.add('d-none');
    orderModal.show();
}

function editOrder(order) {
    document.getElementById('orderId').value = order.id;
    document.getElementById('modalTitle').textContent = 'EDIT ORDER #' + order.id.toString().padStart(4, '0');
    
    document.getElementById('orderProduct').value = order.product_id;
    document.getElementById('orderCustomer').value = order.customer_id;
    document.getElementById('orderQuantity').value = order.quantity;
    document.getElementById('orderStatus').value = order.status;
    document.getElementById('orderDate').value = order.date;
    
    document.getElementById('orderError').classList.add('d-none');
    orderModal.show();
}

async function deleteOrder(id) {
    if (!confirm('Are you sure you want to cancel this order? Stock will be restored.')) return;
    
    try {
        await api.delete(`/orders/${id}`);
        loadOrders();
        // Refresh dropdowns to show restored stock
        document.getElementById('orderProduct').innerHTML = '<option value="">Select Product...</option>';
        loadDropdowns();
        
        document.getElementById('toastMessage').textContent = `Order cancelled & stock restored.`;
        toast.show();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function saveOrder() {
    const errorDiv = document.getElementById('orderError');
    errorDiv.classList.add('d-none');

    const orderId = document.getElementById('orderId').value;
    const prodId = parseInt(document.getElementById('orderProduct').value);
    const qty = parseInt(document.getElementById('orderQuantity').value);

    const data = {
        product_id: prodId,
        customer_id: parseInt(document.getElementById('orderCustomer').value),
        quantity: qty,
        status: document.getElementById('orderStatus').value,
        date: document.getElementById('orderDate').value
    };

    try {
        if (orderId) {
            await api.put(`/orders/${orderId}`, data);
        } else {
            await api.post('/orders', data);
        }
        
        // Success
        orderModal.hide();
        loadOrders();
        
        // Refresh dropdowns to show updated stock
        document.getElementById('orderProduct').innerHTML = '<option value="">Select Product...</option>';
        loadDropdowns();

        // Show success toast
        document.getElementById('toastMessage').textContent = orderId ? 'Order updated successfully.' : `Order processed successfully for ${qty} units. Stock reduced.`;
        toast.show();
        
        // Reset form for next use
        document.getElementById('orderForm').reset();
        document.getElementById('orderId').value = '';
    } catch (error) {
        console.error('Save Order Error:', error);
        errorDiv.textContent = error.message.replace('Error: ', '');
        errorDiv.classList.remove('d-none');
    }
}

function downloadInvoice(order) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFillColor(26, 29, 35);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(108, 255, 108);
    doc.setFontSize(24);
    doc.text('INVENTRIX', 20, 25);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('INVOICE #ORD-' + order.id.toString().padStart(4, '0'), 150, 25);

    // Business Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('From:', 20, 55);
    doc.setFontSize(10);
    doc.text('Inventrix Systems Inc.', 20, 62);
    doc.text('Support: admin@inventory.com', 20, 67);

    // Customer Details
    doc.setFontSize(12);
    doc.text('Bill To:', 120, 55);
    doc.setFontSize(10);
    doc.text(order.customer_name || 'Valued Customer', 120, 62);
    doc.text('Date: ' + order.date, 120, 67);
    doc.text(`TOTAL AMOUNT: INR ${order.total.toFixed(2)}`, 140, 95);

    // Table Header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 80, 170, 10, 'F');
    doc.setFontSize(10);
    doc.text('Description', 25, 87);
    doc.text('Qty', 140, 87);
    doc.text('Status', 165, 87);

    // Table Content
    doc.text(order.product_name || 'Product Details', 25, 100);
    doc.text(order.quantity.toString(), 140, 100);
    doc.text(order.status, 165, 100);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for choosing Inventrix. This is a computer generated invoice.', 70, 150);

    doc.save(`Invoice_ORD-${order.id}.pdf`);
    notifications.show('Invoice generated successfully!', 'success');
}
