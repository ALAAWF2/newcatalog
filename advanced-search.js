// نظام البحث المتقدم
document.addEventListener('DOMContentLoaded', function() {
  // إضافة قسم البحث المتقدم إلى الصفحة الرئيسية
  if (document.querySelector('.filters-container')) {
    const filtersContainer = document.querySelector('.filters-container');
    
    // إنشاء زر لفتح/إغلاق البحث المتقدم
    const advancedSearchToggle = document.createElement('div');
    advancedSearchToggle.className = 'd-flex justify-content-center mt-2';
    advancedSearchToggle.innerHTML = `
      <button id="toggleAdvancedSearch" class="btn btn-outline">
        <i class="fas fa-search-plus"></i>
        <span>البحث المتقدم</span>
        <i class="fas fa-chevron-down"></i>
      </button>
    `;
    
    // إنشاء قسم البحث المتقدم
    const advancedSearchSection = document.createElement('div');
    advancedSearchSection.id = 'advancedSearchSection';
    advancedSearchSection.className = 'mt-3';
    advancedSearchSection.style.display = 'none';
    advancedSearchSection.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h4 class="mb-3">البحث المتقدم</h4>
          <div class="filters-row">
            <div class="filter-group">
              <label>نطاق المخزون:</label>
              <select id="stockRangeFilter">
                <option value="">الكل</option>
                <option value="0-10">أقل من 10 قطع</option>
                <option value="10-50">10 - 50 قطعة</option>
                <option value="50-100">50 - 100 قطعة</option>
                <option value="100+">أكثر من 100 قطعة</option>
              </select>
            </div>
            <div class="filter-group">
              <label>نطاق المبيعات:</label>
              <select id="salesRangeFilter">
                <option value="">الكل</option>
                <option value="0-10">أقل من 10 مبيعات</option>
                <option value="10-50">10 - 50 مبيعات</option>
                <option value="50-100">50 - 100 مبيعات</option>
                <option value="100+">أكثر من 100 مبيعات</option>
              </select>
            </div>
          </div>
          <div class="filters-row">
            <div class="filter-group">
              <label>بحث في الكود:</label>
              <input type="text" id="codeSearchInput" placeholder="بحث بالكود...">
            </div>
            <div class="filter-group">
              <label>بحث في Alias:</label>
              <input type="text" id="aliasSearchInput" placeholder="بحث بالـ Alias...">
            </div>
          </div>
          <div class="d-flex justify-content-center mt-3">
            <button id="applyAdvancedSearch" class="btn btn-primary">
              <i class="fas fa-search"></i>
              تطبيق البحث
            </button>
            <button id="resetAdvancedSearch" class="btn btn-secondary mr-2">
              <i class="fas fa-undo"></i>
              إعادة ضبط
            </button>
          </div>
        </div>
      </div>
    `;
    
    // إضافة العناصر إلى الصفحة
    filtersContainer.appendChild(advancedSearchToggle);
    filtersContainer.appendChild(advancedSearchSection);
    
    // إضافة مستمعي الأحداث
    document.getElementById('toggleAdvancedSearch').addEventListener('click', toggleAdvancedSearch);
    document.getElementById('applyAdvancedSearch').addEventListener('click', applyAdvancedSearch);
    document.getElementById('resetAdvancedSearch').addEventListener('click', resetAdvancedSearch);
    
    // إضافة مستمعي الأحداث للفلاتر المتقدمة
    document.getElementById('stockRangeFilter').addEventListener('change', updateSearchSuggestions);
    document.getElementById('salesRangeFilter').addEventListener('change', updateSearchSuggestions);
    document.getElementById('codeSearchInput').addEventListener('input', updateSearchSuggestions);
    document.getElementById('aliasSearchInput').addEventListener('input', updateSearchSuggestions);
    
    // إضافة قسم اقتراحات البحث
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      const searchContainer = searchInput.parentElement;
      
      // إنشاء قسم اقتراحات البحث
      const suggestionsContainer = document.createElement('div');
      suggestionsContainer.id = 'searchSuggestions';
      suggestionsContainer.className = 'search-suggestions';
      suggestionsContainer.style.display = 'none';
      
      // إضافة قسم الاقتراحات بعد حقل البحث
      searchContainer.appendChild(suggestionsContainer);
      
      // إضافة مستمع الأحداث لحقل البحث
      searchInput.addEventListener('input', function() {
        updateSearchSuggestions();
      });
      
      // إخفاء الاقتراحات عند النقر خارجها
      document.addEventListener('click', function(event) {
        if (!searchInput.contains(event.target) && !suggestionsContainer.contains(event.target)) {
          suggestionsContainer.style.display = 'none';
        }
      });
    }
  }
});

// فتح/إغلاق قسم البحث المتقدم
function toggleAdvancedSearch() {
  const advancedSearchSection = document.getElementById('advancedSearchSection');
  const toggleButton = document.getElementById('toggleAdvancedSearch');
  
  if (advancedSearchSection.style.display === 'none') {
    advancedSearchSection.style.display = 'block';
    toggleButton.querySelector('.fa-chevron-down').classList.replace('fa-chevron-down', 'fa-chevron-up');
  } else {
    advancedSearchSection.style.display = 'none';
    toggleButton.querySelector('.fa-chevron-up').classList.replace('fa-chevron-up', 'fa-chevron-down');
  }
}

// تطبيق البحث المتقدم
function applyAdvancedSearch() {
  renderProducts();
  showToast("تم تطبيق معايير البحث المتقدم", "success");
}

// إعادة ضبط البحث المتقدم
function resetAdvancedSearch() {
  document.getElementById('stockRangeFilter').value = '';
  document.getElementById('salesRangeFilter').value = '';
  document.getElementById('codeSearchInput').value = '';
  document.getElementById('aliasSearchInput').value = '';
  
  renderProducts();
  showToast("تم إعادة ضبط معايير البحث", "info");
}

// تحديث اقتراحات البحث
function updateSearchSuggestions() {
  const searchInput = document.getElementById('searchInput');
  const suggestionsContainer = document.getElementById('searchSuggestions');
  
  if (!searchInput || !suggestionsContainer) return;
  
  const searchTerm = searchInput.value.toLowerCase();
  
  // إذا كان حقل البحث فارغاً، إخفاء الاقتراحات
  if (!searchTerm) {
    suggestionsContainer.style.display = 'none';
    return;
  }
  
  // تطبيق الفلاتر المتقدمة
  let filteredProducts = [...data];
  
  // فلتر نطاق المخزون
  const stockRange = document.getElementById('stockRangeFilter')?.value;
  if (stockRange) {
    const [min, max] = stockRange.split('-');
    if (max) {
      filteredProducts = filteredProducts.filter(p => p.stock >= parseInt(min) && p.stock <= parseInt(max));
    } else {
      filteredProducts = filteredProducts.filter(p => p.stock >= parseInt(min.replace('+', '')));
    }
  }
  
  // فلتر نطاق المبيعات
  const salesRange = document.getElementById('salesRangeFilter')?.value;
  if (salesRange) {
    const [min, max] = salesRange.split('-');
    if (max) {
      filteredProducts = filteredProducts.filter(p => p.sales >= parseInt(min) && p.sales <= parseInt(max));
    } else {
      filteredProducts = filteredProducts.filter(p => p.sales >= parseInt(min.replace('+', '')));
    }
  }
  
  // فلتر الكود
  const codeSearch = document.getElementById('codeSearchInput')?.value.toLowerCase();
  if (codeSearch) {
    filteredProducts = filteredProducts.filter(p => p.code.toLowerCase().includes(codeSearch));
  }
  
  // فلتر Alias
  const aliasSearch = document.getElementById('aliasSearchInput')?.value.toLowerCase();
  if (aliasSearch) {
    filteredProducts = filteredProducts.filter(p => p.alias?.toLowerCase().includes(aliasSearch));
  }
  
  // البحث عن المنتجات التي تطابق مصطلح البحث
  const matchingProducts = filteredProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm) || 
    p.code.toLowerCase().includes(searchTerm) || 
    p.alias?.toLowerCase().includes(searchTerm)
  );
  
  // عرض الاقتراحات (بحد أقصى 5)
  if (matchingProducts.length > 0) {
    const suggestions = matchingProducts.slice(0, 5).map(p => `
      <div class="search-suggestion-item" onclick="selectSearchSuggestion('${p.name}')">
        <div class="suggestion-name">${p.name}</div>
        <div class="suggestion-meta">الكود: ${p.code} | Alias: ${p.alias || '—'}</div>
      </div>
    `).join('');
    
    suggestionsContainer.innerHTML = suggestions;
    suggestionsContainer.style.display = 'block';
  } else {
    suggestionsContainer.style.display = 'none';
  }
}

// اختيار اقتراح بحث
function selectSearchSuggestion(productName) {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = productName;
    document.getElementById('searchSuggestions').style.display = 'none';
    renderProducts();
  }
}

// تعديل وظيفة renderProducts لدعم البحث المتقدم
function renderProducts() {
  document.getElementById('loadingSpinner').style.display = 'block';
  
  const category = document.getElementById('categoryFilter').value;
  const priceRange = document.getElementById('priceFilter').value;
  const sortBy = document.getElementById('sortFilter').value;
  const search = document.getElementById('searchInput').value.toLowerCase();
  
  // فلاتر البحث المتقدم
  const stockRange = document.getElementById('stockRangeFilter')?.value;
  const salesRange = document.getElementById('salesRangeFilter')?.value;
  const codeSearch = document.getElementById('codeSearchInput')?.value.toLowerCase();
  const aliasSearch = document.getElementById('aliasSearchInput')?.value.toLowerCase();
  
  // تصفية المنتجات
  filteredProducts = data.filter(product => {
    // تصفية حسب التصنيف
    if (category && product.category !== category) return false;
    
    // تصفية حسب نطاق السعر
    if (priceRange) {
      const [min, max] = priceRange.split('-');
      if (max && (product.price < parseInt(min) || product.price > parseInt(max))) return false;
      if (!max && product.price < parseInt(min)) return false;
    }
    
    // تصفية حسب البحث
    if (search && !product.alias?.toLowerCase().includes(search) && 
        !product.name.toLowerCase().includes(search) && 
        !product.code.toLowerCase().includes(search)) return false;
    
    // تصفية حسب نطاق المخزون
    if (stockRange) {
      const [min, max] = stockRange.split('-');
      if (max && (product.stock < parseInt(min) || product.stock > parseInt(max))) return false;
      if (!max && product.stock < parseInt(min.replace('+', ''))) return false;
    }
    
    // تصفية حسب نطاق المبيعات
    if (salesRange) {
      const [min, max] = salesRange.split('-');
      if (max && (product.sales < parseInt(min) || product.sales > parseInt(max))) return false;
      if (!max && product.sales < parseInt(min.replace('+', ''))) return false;
    }
    
    // تصفية حسب الكود
    if (codeSearch && !product.code.toLowerCase().includes(codeSearch)) return false;
    
    // تصفية حسب Alias
    if (aliasSearch && !product.alias?.toLowerCase().includes(aliasSearch)) return false;
    
    return true;
  });
  
  // ترتيب المنتجات
  switch (sortBy) {
    case 'price-asc':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'sales-desc':
      filteredProducts.sort((a, b) => b.sales - a.sales);
      break;
    case 'stock-desc':
      filteredProducts.sort((a, b) => b.stock - a.stock);
      break;
    case 'alias-asc':
      filteredProducts.sort((a, b) => (a.alias || '').localeCompare(b.alias || ''));
      break;
  }
  
  // حساب إجمالي المبيعات
  const totalSales = filteredProducts.reduce((sum, p) => sum + p.sales, 0);
  document.getElementById('totalSales').textContent = `إجمالي المبيعات: ${totalSales} قطعة`;
  
  // عرض المنتجات في الصفحة الحالية
  renderPage(currentPage);
  
  // تحديث التصفح
  updatePagination();
  
  document.getElementById('loadingSpinner').style.display = 'none';
}
