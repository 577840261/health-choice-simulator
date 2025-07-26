// 切换标签功能
document.addEventListener('DOMContentLoaded', function() {
    // 标签切换
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有活动状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // 添加当前活动状态
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // 吸烟/饮酒切换
    const habitTypeSelect = document.getElementById('habit-type');
    const smokingSpecificFields = document.querySelectorAll('.smoking-specific');
    const drinkingSpecificFields = document.querySelectorAll('.drinking-specific');

    habitTypeSelect.addEventListener('change', function() {
        if (this.value === 'smoking') {
            smokingSpecificFields.forEach(field => field.style.display = 'block');
            drinkingSpecificFields.forEach(field => field.style.display = 'none');
        } else {
            smokingSpecificFields.forEach(field => field.style.display = 'none');
            drinkingSpecificFields.forEach(field => field.style.display = 'block');
        }
    });

    // 戒烟/减酒计算器
    document.getElementById('calculate-smoking').addEventListener('click', calculateSmokingBenefits);

    // 运动计算器
    document.getElementById('calculate-exercise').addEventListener('click', calculateExerciseBenefits);

    // 初始化图表
    initCharts();

    // 新增：从localStorage加载保存的数据
    loadSavedData();

    // 新增：为所有输入添加事件监听器，实现自动保存
    setupAutoSave();
});

// 新增：保存数据到localStorage
function saveDataToLocalStorage() {
    const smokingData = {
        habitType: document.getElementById('habit-type').value,
        cigarettesPerDay: document.getElementById('cigarettes-per-day').value,
        cigarettePrice: document.getElementById('cigarette-price').value,
        cigarettesPerPack: document.getElementById('cigarettes-per-pack').value,
        drinksPerDay: document.getElementById('drinks-per-day').value,
        drinkPrice: document.getElementById('drink-price').value,
        quitPeriod: document.getElementById('quit-period').value
    };

    const exerciseData = {
        exerciseType: document.getElementById('exercise-type').value,
        exerciseDuration: document.getElementById('exercise-duration').value,
        exerciseFrequency: document.getElementById('exercise-frequency').value,
        userWeight: document.getElementById('user-weight').value
    };

    localStorage.setItem('healthSimulator_smokingData', JSON.stringify(smokingData));
    localStorage.setItem('healthSimulator_exerciseData', JSON.stringify(exerciseData));
    localStorage.setItem('healthSimulator_lastSaved', new Date().toISOString());

    // 显示保存提示
    showNotification('数据已自动保存');
}

// 新增：从localStorage加载数据
function loadSavedData() {
    try {
        const smokingData = JSON.parse(localStorage.getItem('healthSimulator_smokingData'));
        const exerciseData = JSON.parse(localStorage.getItem('healthSimulator_exerciseData'));
        const lastSaved = localStorage.getItem('healthSimulator_lastSaved');

        if (smokingData) {
            for (const [key, value] of Object.entries(smokingData)) {
                const element = document.getElementById(key);
                if (element) element.value = value;
            }

            // 更新显示状态
            if (smokingData.habitType === 'drinking') {
                document.querySelectorAll('.smoking-specific').forEach(field => field.style.display = 'none');
                document.querySelectorAll('.drinking-specific').forEach(field => field.style.display = 'block');
            }
        }

        if (exerciseData) {
            for (const [key, value] of Object.entries(exerciseData)) {
                const element = document.getElementById(key);
                if (element) element.value = value;
            }
        }

        if (lastSaved) {
            const date = new Date(lastSaved);
            showNotification(`已加载上次保存的数据 (${date.toLocaleString()})`);
        }
    } catch (e) {
        console.error('加载保存数据失败:', e);
    }
}

// 新增：设置自动保存
function setupAutoSave() {
    const inputElements = document.querySelectorAll('input, select');
    inputElements.forEach(element => {
        element.addEventListener('change', saveDataToLocalStorage);
        // 添加输入验证
        element.addEventListener('input', function() {
            validateInput(this);
        });
    });
}

// 新增：输入验证
function validateInput(element) {
    const value = element.value;
    const min = parseFloat(element.min) || 0;
    const errorElement = document.getElementById(`${element.id}-error`);

    // 如果不存在错误提示元素，则创建它
    if (!errorElement && element.hasAttribute('required')) {
        const parent = element.parentElement;
        const errorEl = document.createElement('div');
        errorEl.id = `${element.id}-error`;
        errorEl.className = 'error-message';
        errorEl.style.color = 'red';
        errorEl.style.fontSize = '0.8rem';
        errorEl.style.marginTop = '0.3rem';
        parent.appendChild(errorEl);
    }

    // 清除之前的错误
    if (errorElement) errorElement.textContent = '';

    // 验证最小值
    if (value < min) {
        if (errorElement) errorElement.textContent = `值不能小于${min}`;
        element.value = min;
        return false;
    }

    // 特殊字段验证
    if (element.id === 'cigarettes-per-pack' && value < 1) {
        if (errorElement) errorElement.textContent = '每包香烟数量必须至少为1';
        element.value = 1;
        return false;
    }

    return true;
}

// 新增：显示通知
function showNotification(message) {
    // 检查通知元素是否存在
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '4px';
        notification.style.backgroundColor = '#2ecc71';
        notification.style.color = 'white';
        notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        notification.style.zIndex = '1000';
        notification.style.transition = 'opacity 0.3s, transform 0.3s';
        notification.style.transform = 'translateY(100px)';
        notification.style.opacity = '0';
        document.body.appendChild(notification);
    }

    // 设置消息并显示
    notification.textContent = message;
    notification.style.transform = 'translateY(0)';
    notification.style.opacity = '1';

    // 3秒后隐藏
    setTimeout(() => {
        notification.style.transform = 'translateY(100px)';
        notification.style.opacity = '0';
    }, 3000);
}

let riskChart = null;
let exerciseChart = null;

function initCharts() {
    // 风险降低图表
    const riskCtx = document.getElementById('risk-chart').getContext('2d');
    riskChart = new Chart(riskCtx, {
        type: 'bar',
        data: {
            labels: ['肺癌风险', '心脏病风险', '中风风险', '呼吸系统疾病风险'],
            datasets: [{
                label: '风险降低百分比 (%)',
                data: [0, 0, 0, 0],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: '风险降低百分比 (%)'
                    }
                }
            },
            // 新增：响应式配置
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 10,
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });

    // 运动效益图表
    const exerciseCtx = document.getElementById('exercise-chart').getContext('2d');
    exerciseChart = new Chart(exerciseCtx, {
        type: 'radar',
        data: {
            labels: ['心血管健康', '心理健康', '代谢健康', '肌肉骨骼健康', '呼吸功能'],
            datasets: [{
                label: '改善程度 (0-100)',
                data: [0, 0, 0, 0, 0],
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                pointBackgroundColor: 'rgba(153, 102, 255, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(153, 102, 255, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    // 新增：雷达图字体大小响应式调整
                    pointLabels: {
                        font: {
                            size: 11
                        }
                    }
                }
            },
            // 新增：响应式配置
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 10,
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// 计算戒烟/减酒收益
function calculateSmokingBenefits() {
    const habitType = document.getElementById('habit-type').value;
    const quitPeriod = parseInt(document.getElementById('quit-period').value);

    let moneySaved, lifeIncrease, cancerRisk, heartRisk, strokeRisk, respiratoryRisk;

    if (habitType === 'smoking') {
        const cigarettesPerDay = parseInt(document.getElementById('cigarettes-per-day').value);
        const cigarettePrice = parseFloat(document.getElementById('cigarette-price').value);
        const cigarettesPerPack = parseInt(document.getElementById('cigarettes-per-pack').value);

        // 计算每天花费
        const dailyCost = (cigarettesPerDay / cigarettesPerPack) * cigarettePrice;
        // 计算总节省
        moneySaved = (dailyCost * 30 * quitPeriod).toFixed(2);

        // 估算健康收益 (基于医学研究的近似值)
        // 每天吸烟数量越多，戒烟后收益越大
        const smokingIndex = cigarettesPerDay / 20; // 以每天20支为基准

        // 寿命增加 (月)
        lifeIncrease = (smokingIndex * quitPeriod * 0.5).toFixed(1);

        // 风险降低百分比
        cancerRisk = (smokingIndex * 40).toFixed(1); // 肺癌风险降低
        heartRisk = (smokingIndex * 30).toFixed(1);  // 心脏病风险降低
        strokeRisk = (smokingIndex * 25).toFixed(1); // 中风风险降低
        respiratoryRisk = (smokingIndex * 35).toFixed(1); // 呼吸系统疾病风险降低
    } else {
        const drinksPerDay = parseInt(document.getElementById('drinks-per-day').value);
        const drinkPrice = parseFloat(document.getElementById('drink-price').value);

        // 计算每天花费
        const dailyCost = (drinksPerDay / 1000) * drinkPrice;
        // 计算总节省
        moneySaved = (dailyCost * 30 * quitPeriod).toFixed(2);

        // 估算健康收益 (基于医学研究的近似值)
        const drinkingIndex = drinksPerDay / 200; // 以每天200ml为基准

        // 寿命增加 (月)
        lifeIncrease = (drinkingIndex * quitPeriod * 0.3).toFixed(1);

        // 风险降低百分比
        cancerRisk = (drinkingIndex * 15).toFixed(1); // 癌症风险降低
        heartRisk = (drinkingIndex * 20).toFixed(1);  // 心脏病风险降低
        strokeRisk = (drinkingIndex * 25).toFixed(1); // 中风风险降低
        respiratoryRisk = (drinkingIndex * 10).toFixed(1); // 呼吸系统疾病风险降低
    }

    // 更新结果显示
    document.getElementById('money-saved').textContent = moneySaved + ' 元';
    document.getElementById('life-increase').textContent = lifeIncrease + ' 个月';
    document.getElementById('cancer-risk').textContent = cancerRisk + '%';
    document.getElementById('heart-risk').textContent = heartRisk + '%';

    // 新增：更新进度跟踪
    updateQuitProgress();

    // 更新图表
    riskChart.data.datasets[0].data = [cancerRisk, heartRisk, strokeRisk, respiratoryRisk];
    riskChart.update();

    // 新增：显示图表动画
    document.querySelector('#smoking-tab .chart-container').classList.add('visible');
}

// 计算运动效益
function calculateExerciseBenefits() {
    const exerciseType = document.getElementById('exercise-type').value;
    const duration = parseInt(document.getElementById('exercise-duration').value);
    const frequency = parseInt(document.getElementById('exercise-frequency').value);
    const weight = parseInt(document.getElementById('user-weight').value);

    // 不同运动类型的卡路里消耗系数 (每公斤体重每分钟消耗的卡路里)
    const calorieFactors = {
        walking: 0.048,
        jogging: 0.075,
        cycling: 0.08,
        swimming: 0.1,
        weight_training: 0.085,
        // 新增运动类型系数
        yoga: 0.045,
        jumping_rope: 0.13,
        basketball: 0.09,
        badminton: 0.075,
        elliptical: 0.085
    };

    // 计算每次运动消耗的卡路里
    const caloriesPerSession = (calorieFactors[exerciseType] * weight * duration).toFixed(0);
    // 计算每周消耗的卡路里
    const weeklyCalories = (caloriesPerSession * frequency).toFixed(0);

    // 计算健康风险降低和心情改善概率
    // 基于运动强度、频率和持续时间的综合指数
    const exerciseIndex = (duration / 30) * (frequency / 3) * calorieFactors[exerciseType] / 0.075;

    // 心血管疾病风险降低百分比
    const cardioRisk = (exerciseIndex * 25).toFixed(1);
    // 心情改善概率
    const moodImprovement = Math.min(95, (exerciseIndex * 60).toFixed(0)) + '%';

    // 更新结果显示
    document.getElementById('calories-burned').textContent = caloriesPerSession + ' 卡路里';
    document.getElementById('weekly-calories').textContent = weeklyCalories + ' 卡路里';
    document.getElementById('cardio-risk').textContent = cardioRisk + '%';
    document.getElementById('mood-improvement').textContent = moodImprovement;

    // 更新运动效益图表
    // 根据运动类型调整不同方面的改善程度
    let cardioHealth, mentalHealth, metabolicHealth, musculoskeletalHealth, respiratoryFunction;

    switch(exerciseType) {
        case 'walking':
        case 'jogging':
        case 'cycling':
            cardioHealth = exerciseIndex * 80; // 有氧运动对心血管健康特别有益
            respiratoryFunction = exerciseIndex * 75;
            mentalHealth = exerciseIndex * 65;
            metabolicHealth = exerciseIndex * 60;
            musculoskeletalHealth = exerciseIndex * 50;
            break;
        case 'swimming':
            cardioHealth = exerciseIndex * 75;
            respiratoryFunction = exerciseIndex * 85; // 游泳对呼吸系统特别有益
            mentalHealth = exerciseIndex * 70;
            metabolicHealth = exerciseIndex * 65;
            musculoskeletalHealth = exerciseIndex * 70; // 游泳对肌肉骨骼系统有益
            break;
        case 'weight_training':
            cardioHealth = exerciseIndex * 50;
            respiratoryFunction = exerciseIndex * 45;
            mentalHealth = exerciseIndex * 60;
            metabolicHealth = exerciseIndex * 70;
            musculoskeletalHealth = exerciseIndex * 90; // 力量训练对肌肉骨骼系统特别有益
            break;
        // 新增运动类型健康收益
        case 'yoga':
            cardioHealth = exerciseIndex * 45;
            respiratoryFunction = exerciseIndex * 60;
            mentalHealth = exerciseIndex * 90; // 瑜伽对心理健康特别有益
            metabolicHealth = exerciseIndex * 40;
            musculoskeletalHealth = exerciseIndex * 75; // 瑜伽对肌肉骨骼系统有益
            break;
        case 'jumping_rope':
            cardioHealth = exerciseIndex * 90; // 跳绳对心血管健康非常有益
            respiratoryFunction = exerciseIndex * 80;
            mentalHealth = exerciseIndex * 65;
            metabolicHealth = exerciseIndex * 85; // 跳绳对代谢健康有益
            musculoskeletalHealth = exerciseIndex * 60;
            break;
        case 'basketball':
            cardioHealth = exerciseIndex * 85; // 篮球对心血管健康有益
            respiratoryFunction = exerciseIndex * 70;
            mentalHealth = exerciseIndex * 75; // 团队运动对心理健康有益
            metabolicHealth = exerciseIndex * 75;
            musculoskeletalHealth = exerciseIndex * 65;
            break;
        case 'badminton':
            cardioHealth = exerciseIndex * 75;
            respiratoryFunction = exerciseIndex * 65;
            mentalHealth = exerciseIndex * 70;
            metabolicHealth = exerciseIndex * 65;
            musculoskeletalHealth = exerciseIndex * 60;
            break;
        case 'elliptical':
            cardioHealth = exerciseIndex * 80; // 椭圆机对心血管健康有益
            respiratoryFunction = exerciseIndex * 75;
            mentalHealth = exerciseIndex * 60;
            metabolicHealth = exerciseIndex * 70;
            musculoskeletalHealth = exerciseIndex * 55;
            break;
    }

    // 确保数值不超过100
    cardioHealth = Math.min(100, cardioHealth);
    mentalHealth = Math.min(100, mentalHealth);
    metabolicHealth = Math.min(100, metabolicHealth);
    musculoskeletalHealth = Math.min(100, musculoskeletalHealth);
    respiratoryFunction = Math.min(100, respiratoryFunction);

    // 更新图表数据
    exerciseChart.data.datasets[0].data = [
        cardioHealth.toFixed(0),
        mentalHealth.toFixed(0),
        metabolicHealth.toFixed(0),
        musculoskeletalHealth.toFixed(0),
        respiratoryFunction.toFixed(0)
    ];
    exerciseChart.update();

    // 新增：显示图表动画
    document.querySelector('#exercise-tab .chart-container').classList.add('visible');
}

// 新增：初始化戒烟/戒酒进度
function initQuitProgress() {
    const startDate = localStorage.getItem('quit-start-date');
    const quitType = localStorage.getItem('quit-type');
    const targetDays = parseInt(localStorage.getItem('quit-target-days')) || 90; // 默认90天目标

    if (startDate && quitType) {
        document.getElementById('quit-progress-bar').style.width = '0%';
        updateQuitProgress();
    }

    // 添加进度重置按钮事件
    document.getElementById('reset-progress').addEventListener('click', function() {
        const habitType = document.getElementById('habit-type').value;
        const confirmReset = confirm('确定要重置您的戒烟/戒酒进度吗？');
        if (confirmReset) {
            localStorage.setItem('quit-start-date', new Date().toISOString());
            localStorage.setItem('quit-type', habitType);
            localStorage.setItem('quit-target-days', 90); // 90天目标
            updateQuitProgress();
            showNotification('进度已重置，新目标：90天');
        }
    });
}

// 新增：更新戒烟/戒酒进度
function updateQuitProgress() {
    const startDate = localStorage.getItem('quit-start-date') || new Date().toISOString();
    const quitType = localStorage.getItem('quit-type') || document.getElementById('habit-type').value;
    const targetDays = parseInt(localStorage.getItem('quit-target-days')) || 90;

    const start = new Date(startDate);
    const now = new Date();
    const elapsedDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    const progressPercentage = Math.min(100, (elapsedDays / targetDays) * 100);

    // 更新进度条
    document.getElementById('quit-progress-bar').style.width = `${progressPercentage}%`;
    document.getElementById('progress-days').textContent = `已坚持: ${elapsedDays} 天`;
    document.getElementById('progress-percentage').textContent = `${Math.round(progressPercentage)}%`;

    // 根据进度改变颜色
    const progressBar = document.getElementById('quit-progress-bar');
    if (progressPercentage < 33) {
        progressBar.style.backgroundColor = '#e74c3c';
    } else if (progressPercentage < 66) {
        progressBar.style.backgroundColor = '#f39c12';
    } else {
        progressBar.style.backgroundColor = '#2ecc71';
    }
}

// 新增：页面加载时初始化进度跟踪
initQuitProgress();

// 新增：窗口大小改变时重绘图表
window.addEventListener('resize', function() {
    if (riskChart) riskChart.resize();
    if (exerciseChart) exerciseChart.resize();
});