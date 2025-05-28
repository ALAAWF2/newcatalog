// لوحة المعلومات التحليلية
document.addEventListener('DOMContentLoaded', function() {
  // إنشاء زر لوحة المعلومات في شريط التنقل
  const navbar = document.querySelector('.navbar-nav');
  if (navbar) {
    const dashboardButton = document.createElement('a');
    dashboardButton.href = '#';
    dashboardButton.className = 'nav-link';
    dashboardButton.innerHTML = '<i class="fas fa-chart-line"></i> لوحة المعلومات';
    dashboardButton.onclick = function(e) {
      e.preventDefault();
      openDashboard();
    };
    
    // إضافة الزر إلى شريط التنقل
    navbar.insertBefore(dashboardButton, navbar.firstChild);
  }
  
  // إنشاء نافذة لوحة المعلومات
  const dashboardModal = document.createElement('div');
  dashboardModal.id = 'dashboardModal';
  dashboardModal.className = 'modal';
  dashboardModal.innerHTML = `
    <div class="modal-content" style="max-width: 900px;">
      <div class="modal-header">
        <h3>لوحة المعلومات التحليلية</h3>
        <button class="modal-close" onclick="closeDashboard()">×</button>
      </div>
      <div class="modal-body">
        <div class="stats-container">
          <div class="stat-card">
            <i class="fas fa-box-open stat-icon"></i>
            <div class="stat-title">إجمالي المنتجات</div>
            <div class="stat-value" id="totalProducts">0</div>
          </div>
          <div class="stat-card">
            <i class="fas fa-shopping-cart stat-icon"></i>
            <div class="stat-title">إجمالي المبيعات</div>
            <div class="stat-value" id="totalSalesCount">0</div>
          </div>
          <div class="stat-card">
            <i class="fas fa-money-bill-wave stat-icon"></i>
            <div class="stat-title">قيمة المخزون</div>
            <div class="stat-value" id="inventoryValue">0</div>
          </div>
          <div class="stat-card">
            <i class="fas fa-exclamation-triangle stat-icon"></i>
            <div class="stat-title">منتجات منخفضة المخزون</div>
            <div class="stat-value" id="lowStockCount">0</div>
          </div>
        </div>
        
        <div class="row">
          <div class="col">
            <div class="card mb-4">
              <div class="card-header">
                <h4>أكثر المنتجات مبيعاً</h4>
              </div>
              <div class="card-body">
                <div id="topProductsChart" style="height: 300px;"></div>
              </div>
            </div>
          </div>
          <div class="col">
            <div class="card mb-4">
              <div class="card-header">
                <h4>توزيع المخزون حسب التصنيف</h4>
              </div>
              <div class="card-body">
                <div id="categoryStockChart" style="height: 300px;"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card mb-4">
          <div class="card-header">
            <h4>المنتجات منخفضة المخزون</h4>
          </div>
          <div class="card-body">
            <table id="lowStockTable">
              <thead>
                <tr>
                  <th>الكود</th>
                  <th>اسم المنتج</th>
                  <th>التصنيف</th>
                  <th>المخزون الحالي</th>
                  <th>السعر</th>
                  <th>إجراء</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // إضافة نافذة لوحة المعلومات إلى الصفحة
  document.body.appendChild(dashboardModal);
  
  // إضافة مكتبة الرسوم البيانية
  const chartScript = document.createElement('script');
  chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js';
  document.head.appendChild(chartScript);
});

// فتح لوحة المعلومات
function openDashboard() {
  if (!auth.currentUser) {
    showToast("يرجى تسجيل الدخول أولاً", "error");
    return;
  }
  
  document.getElementById('dashboardModal').style.display = 'flex';
  loadDashboardData();
}

// إغلاق لوحة المعلومات
function closeDashboard() {
  document.getElementById('dashboardModal').style.display = 'none';
}

// تحميل بيانات لوحة المعلومات
function loadDashboardData() {
  // التأكد من وجود البيانات
  if (!data || data.length === 0) {
    showToast("لا توجد بيانات متاحة", "error");
    return;
  }
  
  // حساب الإحصائيات الأساسية
  const totalProducts = data.length;
  const totalSales = data.reduce((sum, p) => sum + p.sales, 0);
  const inventoryValue = data.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const lowStockProducts = data.filter(p => p.stock < 10);
  
  // عرض الإحصائيات
  document.getElementById('totalProducts').textContent = totalProducts;
  document.getElementById('totalSalesCount').textContent = totalSales;
  document.getElementById('inventoryValue').textContent = inventoryValue.toLocaleString() + ' ريال';
  document.getElementById('lowStockCount').textContent = lowStockProducts.length;
  
  // عرض المنتجات منخفضة المخزون
  const lowStockTable = document.getElementById('lowStockTable').querySelector('tbody');
  lowStockTable.innerHTML = '';
  
  lowStockProducts.forEach(product => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${product.code}</td>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${product.stock}</td>
      <td>${product.price} ريال</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="addToCart('${product.code}')">
          <i class="fas fa-cart-plus"></i>
          طلب
        </button>
      </td>
    `;
    lowStockTable.appendChild(row);
  });
  
  // إنشاء الرسوم البيانية
  setTimeout(() => {
    createTopProductsChart();
    createCategoryStockChart();
  }, 500);
}

// إنشاء رسم بياني للمنتجات الأكثر مبيعاً
function createTopProductsChart() {
  // التأكد من وجود مكتبة الرسوم البيانية
  if (typeof Chart === 'undefined') {
    setTimeout(createTopProductsChart, 500);
    return;
  }
  
  // الحصول على أكثر 5 منتجات مبيعاً
  const topProducts = [...data]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);
  
  const labels = topProducts.map(p => p.name);
  const salesData = topProducts.map(p => p.sales);
  
  // إنشاء الرسم البياني
  const ctx = document.createElement('canvas');
  ctx.id = 'topProductsChartCanvas';
  document.getElementById('topProductsChart').innerHTML = '';
  document.getElementById('topProductsChart').appendChild(ctx);
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'المبيعات',
        data: salesData,
        backgroundColor: 'rgba(230, 126, 34, 0.7)',
        borderColor: 'rgba(211, 84, 0, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `المبيعات: ${context.raw} قطعة`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'عدد المبيعات'
          }
        }
      }
    }
  });
}

// إنشاء رسم بياني لتوزيع المخزون حسب التصنيف
function createCategoryStockChart() {
  // التأكد من وجود مكتبة الرسوم البيانية
  if (typeof Chart === 'undefined') {
    setTimeout(createCategoryStockChart, 500);
    return;
  }
  
  // حساب المخزون لكل تصنيف
  const categories = {};
  data.forEach(product => {
    if (!categories[product.category]) {
      categories[product.category] = 0;
    }
    categories[product.category] += product.stock;
  });
  
  const labels = Object.keys(categories);
  const stockData = Object.values(categories);
  
  // إنشاء الرسم البياني
  const ctx = document.createElement('canvas');
  ctx.id = 'categoryStockChartCanvas';
  document.getElementById('categoryStockChart').innerHTML = '';
  document.getElementById('categoryStockChart').appendChild(ctx);
  
  // ألوان عشوائية للتصنيفات
  const backgroundColors = [
    'rgba(230, 126, 34, 0.7)',
    'rgba(52, 152, 219, 0.7)',
    'rgba(46, 204, 113, 0.7)',
    'rgba(155, 89, 182, 0.7)',
    'rgba(241, 196, 15, 0.7)',
    'rgba(231, 76, 60, 0.7)',
    'rgba(26, 188, 156, 0.7)'
  ];
  
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: stockData,
        backgroundColor: backgroundColors.slice(0, labels.length),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${context.label}: ${value} قطعة (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}
