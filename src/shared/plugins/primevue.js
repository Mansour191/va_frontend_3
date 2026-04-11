// src/plugins/primevue.js
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';

// استيراد المكونات الأساسية لـ Paclos
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Card from 'primevue/card';
import Sidebar from 'primevue/sidebar';
import Select from 'primevue/select'; 
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import DatePicker from 'primevue/datepicker'; 
import Chart from 'primevue/chart';

const PrimeVuePlugin = {
    install(app) {
        // تهيئة PrimeVue 4
        app.use(PrimeVue, {
            theme: {
                preset: Aura,
                options: {
                    prefix: 'p',
                    darkModeSelector: '.my-app-dark',
                    cssLayer: false // مهم جداً لمنع تداخل التنسيقات مع Vuetify و Tailwind
                }
            }
        });

        // تفعيل الخدمات
        app.use(ToastService);

        // تسجيل المكونات العالمية
        app.component('Button', Button);
        app.component('InputText', InputText);
        app.component('DataTable', DataTable);
        app.component('Column', Column);
        app.component('Card', Card);
        app.component('Sidebar', Sidebar);
        app.component('Select', Select); 
        app.component('Toast', Toast);
        app.component('DatePicker', DatePicker);
        app.component('Chart', Chart);

        // حل مشكلة التوافق مع الأكواد القديمة
        app.component('Calendar', DatePicker);
        app.component('Dropdown', Select);
    }
};

export default PrimeVuePlugin;
