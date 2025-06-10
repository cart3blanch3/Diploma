import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <main className="p-6 max-w-3xl mx-auto text-sm text-gray-800">
      <h1 className="text-2xl font-bold mb-4">Политика конфиденциальности</h1>
      <p>Настоящая Политика конфиденциальности регулирует порядок обработки и защиты персональных данных Пользователей сайта <a href="https://atoystore.kz" className="text-blue-600 underline">https://atoystore.kz</a>.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Общие положения</h2>
      <p>Оператор обязуется соблюдать конфиденциальность и обеспечивать безопасность персональных данных Пользователей.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Основные термины</h2>
      <ul className="list-disc list-inside space-y-1">
        <li><strong>Оператор</strong> – лицо, осуществляющее обработку персональных данных.</li>
        <li><strong>Персональные данные</strong> – информация, относящаяся к прямо или косвенно определённому Пользователю.</li>
        <li><strong>Пользователь</strong> – любой посетитель сайта.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Обработка данных</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>Фамилия, имя</li>
        <li>Электронная почта</li>
        <li>Телефон</li>
        <li>Адрес доставки</li>
      </ul>
      <p>Также мы используем обезличенные данные (cookie, аналитика и др.).</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Цели обработки</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>Обработка и доставка заказов</li>
        <li>Обратная связь</li>
        <li>Соблюдение законодательства</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Контакты</h2>
      <p>ИП «Копалова»<br />
      Email: <a href="mailto:atoystore@gmail.com" className="text-blue-600 underline">atoystore@gmail.com</a><br />
      Сайт: <a href="https://atoystore.kz" className="text-blue-600 underline">atoystore.kz</a>
      </p>
    </main>
  );
};

export default PrivacyPage;
