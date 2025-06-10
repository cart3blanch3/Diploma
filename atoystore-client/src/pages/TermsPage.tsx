import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <main className="p-6 max-w-3xl mx-auto text-sm text-gray-800">
      <h1 className="text-2xl font-bold mb-4">Пользовательское соглашение</h1>
      <p>Настоящее Соглашение регулирует отношения между ИП «Копалова» (далее — Оператор) и Пользователем сайта <a href="https://atoystore.kz" className="text-blue-600 underline">https://atoystore.kz</a>.</p>
      
      <h2 className="text-xl font-semibold mt-6 mb-2">1. Общие положения</h2>
      <p>Используя сайт, Пользователь подтверждает своё согласие с условиями Соглашения. В случае несогласия, следует воздержаться от использования сайта.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Права и обязанности</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>Оператор обязуется не раскрывать персональные данные третьим лицам без согласия Пользователя.</li>
        <li>Пользователь обязуется предоставлять достоверную информацию при оформлении заказа.</li>
        <li>Пользователь несет ответственность за сохранность данных для входа в личный кабинет.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Прочие условия</h2>
      <p>Оператор имеет право вносить изменения в настоящее Соглашение без предварительного уведомления. Новая редакция вступает в силу с момента её размещения на сайте.</p>
    </main>
  );
};

export default TermsPage;
