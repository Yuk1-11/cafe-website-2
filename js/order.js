let products = [];
let cart = {}; // { productId: quantity }
let currentOrderNumber = localStorage.getItem('my_order_number') || null;
let pollTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    if (currentOrderNumber) {
        showStatusView(currentOrderNumber);
        startPolling(currentOrderNumber);
    } else {
        fetchMenu();
    }

    document.getElementById('btn-submit-order').addEventListener('click', submitOrder);
});

async function fetchMenu() {
    try {
        const res = await fetch('api/get_menu.php');
        const data = await res.json();
        products = data.products;
        renderMenu();
    } catch (e) {
        alert('メニューの読み込みに失敗しました');
    }
}

function renderMenu() {
    const list = document.getElementById('menu-list');
    list.innerHTML = '';

    products.forEach(p => {
        const isSoldOut = !p.is_available || p.stock_quantity <= 0;
        const div = document.createElement('div');
        div.className = `card ${isSoldOut ? 'soldout' : ''}`;
        div.innerHTML = `
            <div class="product-info">
                <h3>${p.name}</h3>
                <div class="product-desc">${p.description || ''}</div>
                <div class="product-price">${p.price}円 ${isSoldOut ? '<span style="color:red;">(売り切れ)</span>' : ''}</div>
            </div>
            ${!isSoldOut ? `
                <div class="qty-ctrl">
                    <button class="btn-qty" onclick="changeQty(${p.id}, -1)">-</button>
                    <span class="qty-display" id="qty-${p.id}">0</span>
                    <button class="btn-qty" onclick="changeQty(${p.id}, 1)">+</button>
                </div>
            ` : '<span style="color:#888; font-weight:bold;">完売</span>'}
        `;
        list.appendChild(div);
    });
}

function changeQty(productId, diff) {
    const prod = products.find(p => p.id === productId);
    const cur = cart[productId] || 0;
    const next = cur + diff;

    if (next < 0) return;
    if (next > prod.stock_quantity) {
        alert(`申し訳ありません。残り在庫は${prod.stock_quantity}個です。`);
        return;
    }

    cart[productId] = next;
    document.getElementById(`qty-${productId}`).textContent = next;
    updateCartBar();
}

function updateCartBar() {
    let total = 0;
    let count = 0;
    products.forEach(p => {
        const q = cart[p.id] || 0;
        total += p.price * q;
        count += q;
    });

    document.getElementById('cart-total').textContent = total;
    document.getElementById('btn-submit-order').disabled = count === 0;
}

async function submitOrder() {
    const items = Object.entries(cart)
        .filter(([_, q]) => q > 0)
        .map(([id, q]) => ({ id: parseInt(id), quantity: q }));

    if (!confirm('注文を送信しますか？（お会計は受け取り時となります）')) return;

    try {
        const res = await fetch('api/create_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items })
        });
        const result = await res.json();

        if (result.error) {
            alert(result.error);
            fetchMenu();
            return;
        }

        currentOrderNumber = result.order_number;
        localStorage.setItem('my_order_number', currentOrderNumber);
        showStatusView(currentOrderNumber);
        startPolling(currentOrderNumber);

    } catch (e) {
        alert('注文処理に失敗しました。電波環境を確認してください。');
    }
}

function showStatusView(orderNumber) {
    document.getElementById('menu-view').style.display = 'none';
    document.getElementById('cart-bar').style.display = 'none';
    document.getElementById('status-view').style.display = 'block';
    document.getElementById('disp-order-number').textContent = orderNumber;
}

function startPolling(orderNumber) {
    checkStatus(orderNumber);
    pollTimer = setInterval(() => checkStatus(orderNumber), 3500);
}

async function checkStatus(orderNumber) {
    try {
        const res = await fetch(`api/get_order_status.php?order_number=${encodeURIComponent(orderNumber)}`);
        const data = await res.json();
        if (data.order) {
            const badge = document.getElementById('disp-badge');
            const msg = document.getElementById('status-message');

            if (data.order.status === 'preparing') {
                badge.className = 'badge badge-preparing';
                badge.textContent = '準備中（焼き上がり待ち）';
                msg.textContent = '美味しく焼き上げています。しばらくお待ちください。';
            } else if (data.order.status === 'ready') {
                badge.className = 'badge badge-ready';
                badge.textContent = '🔔 お渡し可能（お呼出中！）';
                msg.innerHTML = '<span style="color:red; font-size:1.1rem;">焼き上がりました！受取口へお越しください。<br>レジにて代金をお支払いください。</span>';
            } else if (data.order.status === 'completed') {
                badge.className = 'badge badge-completed';
                badge.textContent = '受取完了';
                msg.textContent = 'ありがとうございました！美味しく召し上がれ✨';
                clearInterval(pollTimer);
                localStorage.removeItem('my_order_number');
            } else if (data.order.status === 'cancelled') {
                badge.className = 'badge';
                badge.textContent = 'キャンセル済';
                msg.textContent = 'この注文はキャンセルされました。';
                clearInterval(pollTimer);
                localStorage.removeItem('my_order_number');
            }
        }
    } catch (e) {
        console.error('状況更新失敗', e);
    }
}