let pollTimer = null;

document.addEventListener('DOMContentLoaded', checkAuth);

async function checkAuth() {
    const res = await fetch('api/admin/auth.php?action=check');
    const data = await res.json();
    if (data.authenticated) {
        showAdmin();
    }
}

async function login() {
    const password = document.getElementById('staff-pass').value;
    const res = await fetch('api/admin/auth.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (data.success) {
        showAdmin();
    } else {
        alert(data.error || '合言葉が間違っています');
    }
}

async function logout() {
    await fetch('api/admin/auth.php?action=logout');
    location.reload();
}

function showAdmin() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-section').style.display = 'block';
    loadOrders();
    loadStock();
    pollTimer = setInterval(loadOrders, 4000); // 4秒おきに新規注文を自動取得
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (tab === 'orders') {
        document.getElementById('tab-orders').style.display = 'block';
        document.getElementById('tab-stock').style.display = 'none';
        event.target.classList.add('active');
    } else {
        document.getElementById('tab-orders').style.display = 'none';
        document.getElementById('tab-stock').style.display = 'block';
        event.target.classList.add('active');
        loadStock();
    }
}

async function loadOrders() {
    try {
        const res = await fetch('api/admin/get_orders.php');
        const data = await res.json();
        const tbody = document.getElementById('order-rows');
        tbody.innerHTML = '';

        if (!data.orders || data.orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">注文はまだありません</td></tr>';
            return;
        }

        data.orders.forEach(o => {
            const tr = document.createElement('tr');
            const itemsSummary = o.items.map(i => `${i.product_name} × ${i.quantity}`).join('<br>');
            
            tr.innerHTML = `
                <td><strong style="font-size:1.2rem; color:var(--primary);">${o.order_number}</strong></td>
                <td>${itemsSummary}</td>
                <td>${o.total_price}円</td>
                <td>
                    <select class="select-status" onchange="updateStatus(${o.id}, this.value)">
                        <option value="preparing" ${o.status === 'preparing' ? 'selected' : ''}>⏳ 準備中</option>
                        <option value="ready" ${o.status === 'ready' ? 'selected' : ''}>🔔 呼出中 (会計・受渡)</option>
                        <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>✅ 完了</option>
                        <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>❌ キャンセル</option>
                    </select>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error('注文取得エラー', e);
    }
}

async function updateStatus(orderId, status) {
    await fetch('api/admin/update_status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status })
    });
}

async function loadStock() {
    const res = await fetch('api/get_menu.php');
    const data = await res.json();
    const tbody = document.getElementById('stock-rows');
    tbody.innerHTML = '';

    data.products.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${p.name}</strong></td>
            <td>${p.price}円</td>
            <td>
                <input type="number" value="${p.stock_quantity}" style="width: 70px; padding: 4px;" onchange="updateStockQty(${p.id}, this.value)"> 個
            </td>
            <td>
                <button onclick="toggleAvailability(${p.id}, ${p.is_available ? 0 : 1})" style="padding: 6px 12px; border-radius: 4px; cursor: pointer; ${p.is_available ? 'background:#d4edda; color:#155724;' : 'background:#f8d7da; color:#721c24;'}">
                    ${p.is_available ? '販売中' : '売切停止中'}
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function updateStockQty(productId, qty) {
    await fetch('api/admin/update_stock.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, stock: parseInt(qty) })
    });
}

async function toggleAvailability(productId, isAvailable) {
    await fetch('api/admin/update_stock.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, is_available: isAvailable })
    });
    loadStock();
}