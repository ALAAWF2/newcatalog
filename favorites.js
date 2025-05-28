// نظام المفضلة
document.addEventListener('DOMContentLoaded', function() {
  // إضافة قسم المفضلة إلى الصفحة الرئيسية إذا كان المستخدم مسجل الدخول
  if (document.getElementById('productContainer')) {
    const container = document.querySelector('.container');
    const productContainer = document.getElementById('productContainer');
    
    // إنشاء قسم المفضلة
    const favoritesSection = document.createElement('div');
    favoritesSection.id = 'favoritesSection';
    favoritesSection.className = 'favorites-container';
    favoritesSection.style.display = 'none';
    
    // إضافة العنوان والأزرار
    favoritesSection.innerHTML = `
      <div class="favorites-header">
        <h2 class="favorites-title">
          <i class="fas fa-heart"></i>
          المنتجات المفضلة
        </h2>
        <div class="favorites-actions">
          <button id="createOrderFromFavorites" class="btn btn-success">
            <i class="fas fa-shopping-cart"></i>
            إنشاء طلبية من المفضلة
          </button>
          <button id="clearFavorites" class="btn btn-danger">
            <i class="fas fa-trash"></i>
            مسح المفضلة
          </button>
        </div>
      </div>
      <div id="favoritesList" class="product-grid"></div>
    `;
    
    // إضافة قسم المفضلة قبل قسم المنتجات
    container.insertBefore(favoritesSection, productContainer.parentNode);
    
    // إضافة مستمعي الأحداث للأزرار
    document.getElementById('createOrderFromFavorites').addEventListener('click', createOrderFromFavorites);
    document.getElementById('clearFavorites').addEventListener('click', clearFavorites);
  }
  
  // تحميل المفضلة عند تسجيل الدخول
  auth.onAuthStateChanged(user => {
    if (user && document.getElementById('favoritesSection')) {
      loadFavorites();
    }
  });
});

// تحميل المفضلة من localStorage
function loadFavorites() {
  if (!auth.currentUser) return;

  const userId = auth.currentUser.uid;
  const favorites = JSON.parse(localStorage.getItem(`favorites_${userId}`)) || [];

  const favoritesSection = document.getElementById('favoritesSection');
  const favoritesList = document.getElementById('favoritesList');

  if (!favoritesSection || !favoritesList) {
    console.warn("عنصر المفضلة غير موجود في الصفحة بعد، سيتم تجاهل التحميل.");
    return;
  }

  if (favorites.length === 0) {
    favoritesSection.style.display = 'none';
    return;
  }

  favoritesSection.style.display = 'block';
  favoritesList.innerHTML = '';

  const favoriteProducts = data.filter(product => favorites.includes(product.code));

  favoriteProducts.forEach(product => {
    const isLowStock = product.stock < 10;

    const productElement = document.createElement('div');
    productElement.className = 'product-card';
    productElement.innerHTML = `
      <div class="product-image">
        <img src="images/${product.code}.jpg" 
             alt="${product.name}" 
             onclick="openProductModal(${JSON.stringify(product).replace(/"/g, '&quot;')})"
             onerror="this.onerror=null;this.src='images/no-image.png';this.classList.add('error')">
        <div class="product-overlay">
          <button class="favorite-btn active" onclick="toggleFavorite('${product.code}')">
            <i class="fas fa-heart"></i>
          </button>
        </div>
      </div>
      <div class="product-body">
        <h4 class="product-title">${product.name}</h4>
        <p class="product-meta">الكود: ${product.code}</p>
        <p class="product-meta">Alias: ${product.alias || '—'}</p>
        <div class="product-price">${product.price} ريال</div>
        <p class="product-stock ${isLowStock ? 'low' : ''}">المخزون: ${product.stock} قطعة</p>
      </div>
      <div class="product-footer">
        <input type="number" min="1" max="${product.stock}" value="1" id="fav-qty-${product.code}" class="product-quantity">
        <button class="btn" onclick="addToCartFromFavorites('${product.code}')">
          <i class="fas fa-cart-plus"></i>
          إضافة للطلبية
        </button>
      </div>
    `;

    favoritesList.appendChild(productElement);
  });
}


// إضافة أو إزالة منتج من المفضلة
function toggleFavorite(code) {
  if (!auth.currentUser) {
    showToast("يرجى تسجيل الدخول أولاً", "error");
    return;
  }
  
  const userId = auth.currentUser.uid;
  let favorites = JSON.parse(localStorage.getItem(`favorites_${userId}`)) || [];
  
  const index = favorites.indexOf(code);
  
  if (index === -1) {
    // إضافة إلى المفضلة
    favorites.push(code);
    showToast("تمت إضافة المنتج إلى المفضلة", "success");
  } else {
    // إزالة من المفضلة
    favorites.splice(index, 1);
    showToast("تمت إزالة المنتج من المفضلة", "info");
  }
  
  localStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));
  
  // تحديث حالة أزرار المفضلة في الصفحة
  updateFavoriteButtons();
  
  // تحديث قسم المفضلة
  loadFavorites();
}

// تحديث حالة أزرار المفضلة في الصفحة
function updateFavoriteButtons() {
  if (!auth.currentUser) return;
  
  const userId = auth.currentUser.uid;
  const favorites = JSON.parse(localStorage.getItem(`favorites_${userId}`)) || [];
  
  // تحديث أزرار المفضلة في قائمة المنتجات
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    const productCode = btn.getAttribute('data-code') || btn.onclick.toString().match(/'([^']+)'/)[1];
    
    if (favorites.includes(productCode)) {
      btn.classList.add('active');
      btn.innerHTML = '<i class="fas fa-heart"></i>';
    } else {
      btn.classList.remove('active');
      btn.innerHTML = '<i class="far fa-heart"></i>';
    }
  });
}

// إضافة منتج من المفضلة إلى سلة التسوق
function addToCartFromFavorites(code) {
  if (!auth.currentUser) {
    showToast("يرجى تسجيل الدخول أولاً", "error");
    return;
  }
  
  const qtyInput = document.getElementById(`fav-qty-${code}`);
  const qty = parseInt(qtyInput.value);
  
  if (!qty || qty <= 0) {
    showToast("يرجى إدخال كمية صحيحة", "error");
    return;
  }
  
  const product = data.find(p => p.code === code);
  
  if (qty > product.stock) {
    showToast(`الكمية المطلوبة غير متوفرة. المتاح: ${product.stock}`, "error");
    qtyInput.value = product.stock;
    return;
  }
  
  // إضافة أو تحديث المنتج في السلة
  cart[code] = {
    qty,
    alias: product.alias
  };
  
  updateCartBadge();
  showToast(`تمت إضافة ${product.name} إلى السلة`, "success");
}

// إنشاء طلبية من المفضلة
function createOrderFromFavorites() {
  if (!auth.currentUser) {
    showToast("يرجى تسجيل الدخول أولاً", "error");
    return;
  }
  
  const userId = auth.currentUser.uid;
  const favorites = JSON.parse(localStorage.getItem(`favorites_${userId}`)) || [];
  
  if (favorites.length === 0) {
    showToast("لا توجد منتجات في المفضلة", "error");
    return;
  }
  
  // إضافة جميع المنتجات المفضلة إلى السلة
  favorites.forEach(code => {
    const product = data.find(p => p.code === code);
    if (product && product.stock > 0) {
      const qty = Math.min(1, product.stock); // كمية افتراضية 1 أو أقصى مخزون متاح
      
      cart[code] = {
        qty,
        alias: product.alias
      };
    }
  });
  
  updateCartBadge();
  showToast("تمت إضافة المنتجات المفضلة إلى السلة", "success");
  
  // فتح نافذة تأكيد الطلبية
  openOrderModal();
}

// مسح المفضلة
function clearFavorites() {
  if (!auth.currentUser) {
    showToast("يرجى تسجيل الدخول أولاً", "error");
    return;
  }
  
  const userId = auth.currentUser.uid;
  
  // عرض تأكيد قبل المسح
  if (confirm("هل أنت متأكد من مسح جميع المنتجات المفضلة؟")) {
    localStorage.setItem(`favorites_${userId}`, JSON.stringify([]));
    showToast("تم مسح المفضلة بنجاح", "success");
    
    // تحديث العرض
    loadFavorites();
    updateFavoriteButtons();
  }
}
